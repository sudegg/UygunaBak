import express from 'express';
import { Pool } from 'pg';
import { verifyToken, requireAdmin } from './middleware/auth.js';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool();

// Tüm admin rotaları JWT doğrulaması ve Admin yetki kontrolünden geçer
router.use(verifyToken, requireAdmin);

// 1. Tüm Cafeleri Getir (Admin Paneli için)
router.get('/cafes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.is_active, c.owner_id, l.city, l.district,
              COALESCE(ROUND(AVG(r.calculated_rating)::numeric, 2), 0) as avg_rating,
              COUNT(DISTINCT f.id) as favorite_count
       FROM cafes c
       LEFT JOIN locations l ON c.location_id = l.id
       LEFT JOIN reviews r ON c.id = r.cafe_id AND r.is_visible = TRUE
       LEFT JOIN favorites f ON c.id = f.cafe_id
       GROUP BY c.id, c.name, c.is_active, c.owner_id, l.city, l.district
       ORDER BY c.name ASC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Admin cafes fetch error:', error);
    res.status(500).json({ success: false, message: 'Kafeler alınamadı.' });
  }
});

// 2. Seçili Cafe Detaylarını Getir (Admin olarak Owner Dashboard verisi)
router.get('/cafes/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    // Cafe Detayları
    const cafeResult = await pool.query(
      `SELECT c.id, c.name, c.is_active, c.owner_id, c.address, l.city, l.district,
              COALESCE(ROUND(AVG(r.calculated_rating)::numeric, 2), 0) as avg_rating
       FROM cafes c
       LEFT JOIN locations l ON c.location_id = l.id
       LEFT JOIN reviews r ON c.id = r.cafe_id AND r.is_visible = TRUE
       WHERE c.id = $1
       GROUP BY c.id, c.name, c.is_active, c.owner_id, c.address, l.city, l.district`,
      [id]
    );

    if (cafeResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Kafe bulunamadı.' });
    }

    const cafe = cafeResult.rows[0];

    // Favori Sayısı
    const favQuery = await pool.query('SELECT COUNT(*) as fav_count FROM favorites WHERE cafe_id = $1', [id]);
    const favoritesCount = parseInt(favQuery.rows[0].fav_count, 10);

    // Haftalık Puan Trendi
    const trendQuery = await pool.query(`
      SELECT COALESCE(ROUND(AVG(calculated_rating)::numeric, 2), 0) as weekly_trend
      FROM reviews 
      WHERE cafe_id = $1 
      AND created_at >= NOW() - INTERVAL '7 days' 
      AND is_visible = TRUE
    `, [id]);
    const weeklyTrend = parseFloat(trendQuery.rows[0].weekly_trend);

    // Owner'ın diğer Cafeleri
    const otherCafesResult = await pool.query(
      `SELECT c.id, c.name, c.is_active, l.city, l.district
       FROM cafes c
       JOIN locations l ON c.location_id = l.id
       WHERE c.owner_id = $1
       ORDER BY c.name ASC`,
      [cafe.owner_id]
    );

    res.json({
      success: true,
      cafe,
      cafes: otherCafesResult.rows,
      basicAnalytics: {
        favorites: favoritesCount,
        weeklyTrend: weeklyTrend
      }
    });
  } catch (error) {
    console.error('Admin cafe details fetch error:', error);
    res.status(500).json({ success: false, message: 'Kafe detayları alınamadı.' });
  }
});

// 3. Cafe Ürünlerini Getir (Admin olarak seçilen cafenin menüsü)
router.get('/cafes/:id/products', async (req, res) => {
  try {
    const { id } = req.params;

    const productsResult = await pool.query(
      `SELECT p.id, p.name, p.price, p.currency, p.is_available, cat.name AS category_name, p.updated_at
       FROM products p
       LEFT JOIN categories cat ON p.category_id = cat.id
       WHERE p.cafe_id = $1
       ORDER BY p.updated_at DESC, p.name ASC`,
      [id]
    );

    res.json({ success: true, data: productsResult.rows });
  } catch (error) {
    console.error('Admin cafe products fetch error:', error);
    res.status(500).json({ success: false, message: 'Kafe ürünleri alınamadı.' });
  }
});

// 4. Cafe Durumunu Güncelle
router.put('/cafes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Geçersiz durum değeri.' });
    }

    const result = await pool.query(
      `UPDATE cafes
       SET is_active = $1
       WHERE id = $2
       RETURNING id, name, is_active`,
      [is_active, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Kafe bulunamadı.' });
    }

    res.json({ success: true, cafe: result.rows[0] });
  } catch (error) {
    console.error('Admin cafe status update error:', error);
    res.status(500).json({ success: false, message: 'Kafe durumu güncellenemedi.' });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const { cafe_id: cafeId } = req.query;
    const params = [];
    const filters = [];

    if (cafeId) {
      params.push(cafeId);
      filters.push(`cr.cafe_id = $${params.length}`);
    }

    const { rows } = await pool.query(
      `SELECT
         cr.id,
         cr.cafe_id,
         c.name AS cafe_name,
         cr.report_type,
         cr.title,
         cr.description,
         cr.status,
         cr.created_at,
         cr.resolved_at,
         reporter.full_name AS reporter_name,
         owner.full_name AS owner_name,
         l.city,
         l.district
       FROM cafe_reports cr
       JOIN cafes c ON c.id = cr.cafe_id
       JOIN locations l ON l.id = c.location_id
       LEFT JOIN users reporter ON reporter.id = cr.reporter_id
       LEFT JOIN users owner ON owner.id = c.owner_id
       ${filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''}
       ORDER BY cr.created_at DESC, cr.status ASC, c.name ASC`
      , params
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Admin reports fetch error:', error);
    res.status(500).json({ success: false, message: 'Raporlar alınamadı.' });
  }
});

router.put('/reports/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows, rowCount } = await pool.query(
      `UPDATE cafe_reports
       SET status = 'resolved',
           resolved_at = NOW(),
           resolved_by = $2
       WHERE id = $1
       RETURNING *`,
      [id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Rapor bulunamadı.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Admin report resolve error:', error);
    res.status(500).json({ success: false, message: 'Rapor çözümlenemedi.' });
  }
});

// Admin: seçilen kafe için menüye ürün ekle
router.post('/cafes/:id/products', async (req, res) => {
  try {
    const { id: cafeId } = req.params;
    const { name, price, category_id, category_name } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ success: false, message: 'Ürün adı ve fiyat gerekli.' });
    }

    const cafeCheck = await pool.query('SELECT id FROM cafes WHERE id = $1', [cafeId]);
    if (cafeCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Kafe bulunamadı.' });
    }

    let resolvedCategoryId = category_id || null;
    if (!resolvedCategoryId && category_name) {
      const categoryResult = await pool.query(
        `SELECT id FROM categories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) LIMIT 1`,
        [category_name]
      );
      resolvedCategoryId = categoryResult.rows[0]?.id || null;
    }
    if (!resolvedCategoryId) {
      const fallbackCategory = await pool.query('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
      resolvedCategoryId = fallbackCategory.rows[0]?.id || null;
    }
    if (!resolvedCategoryId) {
      return res.status(400).json({ success: false, message: 'Kategori bulunamadı.' });
    }

    const newProduct = await pool.query(
      `INSERT INTO products (cafe_id, category_id, name, price) VALUES ($1, $2, $3, $4) RETURNING *`,
      [cafeId, resolvedCategoryId, name, price]
    );
    res.status(201).json({ success: true, data: newProduct.rows[0] });
  } catch (error) {
    console.error('Admin product insert error:', error);
    res.status(500).json({ success: false, message: 'Ürün eklenemedi.' });
  }
});

router.put('/cafes/:cafeId/products/:productId', async (req, res) => {
  try {
    const { cafeId, productId } = req.params;
    const { price, is_available, name } = req.body;

    const check = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND cafe_id = $2',
      [productId, cafeId]
    );
    if (check.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Ürün bulunamadı.' });
    }

    const { rows } = await pool.query(
      `UPDATE products SET
         price = COALESCE($1, price),
         is_available = COALESCE($2, is_available),
         name = COALESCE($3, name),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND cafe_id = $5
       RETURNING *`,
      [price, is_available, name, productId, cafeId]
    );
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Admin product update error:', error);
    res.status(500).json({ success: false, message: 'Ürün güncellenemedi.' });
  }
});

router.get('/cafes/:id/campaigns', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, cafe_id, title, description, discount_percent, starts_at, ends_at, is_active, created_at
       FROM cafe_campaigns WHERE cafe_id = $1 ORDER BY starts_at DESC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Admin campaigns fetch error:', error);
    res.status(500).json({ success: false, message: 'Kampanyalar alınamadı.' });
  }
});

router.post('/cafes/:id/campaigns', async (req, res) => {
  try {
    const { id: cafeId } = req.params;
    const { title, description, discount_percent, starts_at, ends_at, is_active } = req.body;
    if (!title || !starts_at || !ends_at) {
      return res.status(400).json({ success: false, message: 'Başlık ve tarihler zorunludur.' });
    }
    const exists = await pool.query('SELECT id FROM cafes WHERE id = $1', [cafeId]);
    if (exists.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Kafe bulunamadı.' });
    }
    const { rows } = await pool.query(
      `INSERT INTO cafe_campaigns (cafe_id, title, description, discount_percent, starts_at, ends_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, TRUE)) RETURNING *`,
      [cafeId, title, description || null, discount_percent ?? null, starts_at, ends_at, is_active]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Admin campaign create error:', error);
    res.status(500).json({ success: false, message: 'Kampanya oluşturulamadı.' });
  }
});

router.put('/cafes/:cafeId/campaigns/:campaignId', async (req, res) => {
  try {
    const { cafeId, campaignId } = req.params;
    const { title, description, discount_percent, starts_at, ends_at, is_active } = req.body;
    const own = await pool.query(
      'SELECT id FROM cafe_campaigns WHERE id = $1 AND cafe_id = $2',
      [campaignId, cafeId]
    );
    if (own.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Kampanya bulunamadı.' });
    }
    const { rows } = await pool.query(
      `UPDATE cafe_campaigns SET
         title = COALESCE($1, title),
         description = $2,
         discount_percent = $3,
         starts_at = COALESCE($4, starts_at),
         ends_at = COALESCE($5, ends_at),
         is_active = COALESCE($6, is_active)
       WHERE id = $7 AND cafe_id = $8 RETURNING *`,
      [
        title ?? null,
        description,
        discount_percent,
        starts_at ?? null,
        ends_at ?? null,
        typeof is_active === 'boolean' ? is_active : null,
        campaignId,
        cafeId,
      ]
    );
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Admin campaign update error:', error);
    res.status(500).json({ success: false, message: 'Kampanya güncellenemedi.' });
  }
});

router.delete('/cafes/:cafeId/campaigns/:campaignId', async (req, res) => {
  try {
    const { cafeId, campaignId } = req.params;
    const del = await pool.query(
      'DELETE FROM cafe_campaigns WHERE id = $1 AND cafe_id = $2',
      [campaignId, cafeId]
    );
    if (del.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Kampanya bulunamadı.' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Admin campaign delete error:', error);
    res.status(500).json({ success: false, message: 'Kampanya silinemedi.' });
  }
});

export default router;