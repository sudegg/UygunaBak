import express from 'express';
import { Pool } from 'pg';
import { verifyToken, requireOwner } from './middleware/auth.js';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool();

// Tüm Owner rotaları JWT doğrulaması ve Owner yetki kontrolünden geçer
router.use(verifyToken, requireOwner);

const getOwnedCafe = async (pool, userId, cafeId = null) => {
    if (cafeId) {
        const selectedCafe = await pool.query(
            `SELECT c.id, c.name, c.is_active, l.city, l.district
             FROM cafes c
             JOIN locations l ON c.location_id = l.id
             WHERE c.id = $1 AND c.owner_id = $2`,
            [cafeId, userId]
        );
        if (selectedCafe.rowCount === 0) return null;
        return selectedCafe.rows[0];
    }

    const defaultCafe = await pool.query(
        `SELECT c.id, c.name, c.is_active, l.city, l.district
         FROM cafes c
         JOIN locations l ON c.location_id = l.id
         WHERE c.owner_id = $1
         ORDER BY c.name ASC
         LIMIT 1`,
        [userId]
    );

    return defaultCafe.rows[0] || null;
};

router.get('/cafes', async (req, res) => {
    try {
        const userId = req.user.id;
        const cafesResult = await pool.query(
            `SELECT c.id, c.name, c.is_active, l.city, l.district
             FROM cafes c
             JOIN locations l ON c.location_id = l.id
             WHERE c.owner_id = $1
             ORDER BY c.name ASC`,
            [userId]
        );

        res.json({ success: true, data: cafesResult.rows });
    } catch (error) {
        console.error('Owner cafes fetch error:', error);
        res.status(500).json({ success: false, message: 'Kafeler alınamadı.' });
    }
});

// 1. İşletme Temel Bilgileri ve Analitik Bloğu
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.id;
        const cafeId = req.query.cafe_id || null;

        const cafe = await getOwnedCafe(pool, userId, cafeId);
        if (!cafe) {
            return res.status(404).json({ success: false, message: 'Bu hesaba bağlı bir işletme bulunamadı.' });
        }

        // Analitik 1: Favori Sayısı
        const favQuery = await pool.query('SELECT COUNT(*) as fav_count FROM favorites WHERE cafe_id = $1', [cafe.id]);
        const favoritesCount = parseInt(favQuery.rows[0].fav_count, 10);

        // Analitik 2: Haftalık Puan Trendi (Geçmiş 7 günün ortalaması)
        const trendQuery = await pool.query(`
            SELECT COALESCE(ROUND(AVG(calculated_rating), 2), 0.00) as weekly_trend
            FROM reviews 
            WHERE cafe_id = $1 
            AND created_at >= NOW() - INTERVAL '7 days' 
            AND is_visible = TRUE
        `, [cafe.id]);
        const weeklyTrend = parseFloat(trendQuery.rows[0].weekly_trend);

        res.json({
            success: true,
            cafe,
            cafes: await pool.query(
                `SELECT c.id, c.name, c.is_active, l.city, l.district
                 FROM cafes c
                 JOIN locations l ON c.location_id = l.id
                 WHERE c.owner_id = $1
                 ORDER BY c.name ASC`,
                [userId]
            ).then(result => result.rows),
            basicAnalytics: {
                favorites: favoritesCount,
                weeklyTrend: weeklyTrend
            }
        });
    } catch (error) {
        console.error('Owner Dashboard Error:', error);
        res.status(500).json({ success: false, message: 'Veriler alınırken bir sunucu hatası oluştu.' });
    }
});

// 2. Kafenin Açık/Kapalı Durumu (Toggle Switch)
router.put('/status', async (req, res) => {
    try {
        const { is_active, cafe_id } = req.body;
        const userId = req.user.id;

        const selectedCafeId = cafe_id || null;

        const targetCafe = await getOwnedCafe(pool, userId, selectedCafeId);
        if (!targetCafe) {
            return res.status(404).json({ success: false, message: 'İşletme bulunamadı veya yetkiniz yok.' });
        }

        const updateQuery = `
            UPDATE cafes 
            SET is_active = $1 
            WHERE id = $2 AND owner_id = $3 
            RETURNING id, name, is_active
        `;
        const result = await pool.query(updateQuery, [is_active, targetCafe.id, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'İşletme bulunamadı veya yetkiniz yok.' });
        }

        res.json({ success: true, cafe: result.rows[0] });

    } catch (error) {
        console.error('Status Update Error:', error);
        res.status(500).json({ success: false, message: 'Durum güncellenemedi.' });
    }
});

// 3. Menü Ürünlerini Getirme
router.get('/products', async (req, res) => {
    try {
        const userId = req.user.id;
        const cafeId = req.query.cafe_id || null;
        const targetCafe = await getOwnedCafe(pool, userId, cafeId);
        if (!targetCafe) {
            return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
        }
        const productsQuery = `
            SELECT p.id, p.name, p.price, p.is_available, cg.name as category_name
            FROM products p
            JOIN cafes c ON p.cafe_id = c.id
            LEFT JOIN categories cg ON p.category_id = cg.id
            WHERE c.owner_id = $1 AND c.id = $2
            ORDER BY p.updated_at DESC
        `;
        const { rows } = await pool.query(productsQuery, [userId, targetCafe.id]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ürünler alınamadı.' });
    }
});

// 4. Ürün Fiyatını veya Bilgisini Güncelleme (Optimistic UI destekli)
router.put('/products/:id', async (req, res) => {
    try {
        const { price, is_available } = req.body;
        const productId = req.params.id;
        const userId = req.user.id;

        // Güvenlik adımı: Güncellenen ürünün sahibi bu user mı?
        const checkOwnershipQuery = `
            SELECT 1 FROM products p
            JOIN cafes c ON p.cafe_id = c.id
            WHERE p.id = $1 AND c.owner_id = $2
        `;
        const validation = await pool.query(checkOwnershipQuery, [productId, userId]);
        if (validation.rowCount === 0) {
            return res.status(403).json({ success: false, message: 'Bu işlemi yapmaya yetkiniz yok.' });
        }

        const updateQuery = `
            UPDATE products 
            SET price = COALESCE($1, price), 
                is_available = COALESCE($2, is_available),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        const { rows } = await pool.query(updateQuery, [price, is_available, productId]);
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Product Update Error:', error);
        res.status(500).json({ success: false, message: 'Ürün güncellenemedi.' });
    }
});

// 5. Yeni Ürün Ekleme
router.post('/products', async (req, res) => {
    try {
        const { name, price, category_id, category_name, cafe_id } = req.body;
        const userId = req.user.id;

        const targetCafe = await getOwnedCafe(pool, userId, cafe_id || null);
        if (!targetCafe) return res.status(404).json({ success: false, message: 'İşletme bulunamadı' });

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

        const insertQuery = `
            INSERT INTO products (cafe_id, category_id, name, price)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const newProduct = await pool.query(insertQuery, [targetCafe.id, resolvedCategoryId, name, price]);

        res.status(201).json({ success: true, data: newProduct.rows[0] });
    } catch (error) {
        console.error('Product Insert Error:', error);
        res.status(500).json({ success: false, message: 'Ürün eklenemedi.' });
    }
});

// Kampanyalar — işletme sahibi
router.get('/campaigns', async (req, res) => {
    try {
        const cafeId = req.query.cafe_id || null;
        const targetCafe = await getOwnedCafe(pool, req.user.id, cafeId);
        if (!targetCafe) {
            return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
        }
        const { rows } = await pool.query(
            `SELECT id, cafe_id, title, description, discount_percent, starts_at, ends_at, is_active, created_at
             FROM cafe_campaigns WHERE cafe_id = $1 ORDER BY starts_at DESC`,
            [targetCafe.id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Owner campaigns list error:', error);
        res.status(500).json({ success: false, message: 'Kampanyalar alınamadı.' });
    }
});

router.post('/campaigns', async (req, res) => {
    try {
        const { cafe_id, title, description, discount_percent, starts_at, ends_at, is_active } = req.body;
        if (!title || !starts_at || !ends_at) {
            return res.status(400).json({ success: false, message: 'Başlık ve tarihler zorunludur.' });
        }
        const targetCafe = await getOwnedCafe(pool, req.user.id, cafe_id || null);
        if (!targetCafe) {
            return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
        }
        const { rows } = await pool.query(
            `INSERT INTO cafe_campaigns (cafe_id, title, description, discount_percent, starts_at, ends_at, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, TRUE)) RETURNING *`,
            [targetCafe.id, title, description || null, discount_percent ?? null, starts_at, ends_at, is_active]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Owner campaign create error:', error);
        res.status(500).json({ success: false, message: 'Kampanya oluşturulamadı.' });
    }
});

router.get('/reports', async (req, res) => {
    try {
        const cafeId = req.query.cafe_id || null;
        const targetCafe = await getOwnedCafe(pool, req.user.id, cafeId) || await getOwnedCafe(pool, req.user.id);
        if (!targetCafe) {
            return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
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
                reporter.full_name AS reporter_name
             FROM cafe_reports cr
             JOIN cafes c ON c.id = cr.cafe_id
             LEFT JOIN users reporter ON reporter.id = cr.reporter_id
             WHERE cr.cafe_id = $1
             ORDER BY cr.created_at DESC`,
            [targetCafe.id]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Owner reports fetch error:', error);
        res.status(500).json({ success: false, message: 'Raporlar alınamadı.' });
    }
});

router.post('/reports', async (req, res) => {
    try {
        const { cafe_id, report_type, title, description } = req.body;

        if (!cafe_id || !report_type || !title || !description) {
            return res.status(400).json({ success: false, message: 'Rapor için tüm alanlar zorunludur.' });
        }

        const targetCafe = await getOwnedCafe(pool, req.user.id, cafe_id) || await getOwnedCafe(pool, req.user.id);
        if (!targetCafe) {
            return res.status(404).json({ success: false, message: 'İşletme bulunamadı.' });
        }

        const { rows } = await pool.query(
            `INSERT INTO cafe_reports (cafe_id, reporter_id, report_type, title, description, status)
             VALUES ($1, $2, $3, $4, $5, 'open')
             RETURNING *`,
            [targetCafe.id, req.user.id, report_type, title, description]
        );

        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Owner report create error:', error);
        res.status(500).json({ success: false, message: 'Rapor oluşturulamadı.' });
    }
});

router.put('/campaigns/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const own = await pool.query(
            `SELECT cc.id FROM cafe_campaigns cc
             JOIN cafes c ON c.id = cc.cafe_id
             WHERE cc.id = $1 AND c.owner_id = $2`,
            [campaignId, req.user.id]
        );
        if (own.rowCount === 0) {
            return res.status(403).json({ success: false, message: 'Bu kampanyayı düzenleme yetkiniz yok.' });
        }
        const { title, description, discount_percent, starts_at, ends_at, is_active } = req.body;
        const { rows } = await pool.query(
            `UPDATE cafe_campaigns SET
                title = COALESCE($1, title),
                description = $2,
                discount_percent = $3,
                starts_at = COALESCE($4, starts_at),
                ends_at = COALESCE($5, ends_at),
                is_active = COALESCE($6, is_active)
             WHERE id = $7 RETURNING *`,
            [
                title ?? null,
                description,
                discount_percent,
                starts_at ?? null,
                ends_at ?? null,
                typeof is_active === 'boolean' ? is_active : null,
                campaignId,
            ]
        );
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Owner campaign update error:', error);
        res.status(500).json({ success: false, message: 'Kampanya güncellenemedi.' });
    }
});

router.delete('/campaigns/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const del = await pool.query(
            `DELETE FROM cafe_campaigns cc USING cafes c
             WHERE cc.id = $1 AND cc.cafe_id = c.id AND c.owner_id = $2`,
            [campaignId, req.user.id]
        );
        if (del.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Kampanya bulunamadı veya yetkisiz.' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Owner campaign delete error:', error);
        res.status(500).json({ success: false, message: 'Kampanya silinemedi.' });
    }
});

export default router;