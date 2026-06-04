/**
 * Kafeler Kontrolcüsü (Cafes Controller)
 * 
 * Bu module uygulamanın kafe listeleme, filtreleme ve detay görüntüleme
 * işlemlerini yönetir. Gelişmiş filtreleme özellikleri ile konum, fiyat,
 * derecelendirme ve özellik bazında kafeler bulunabilir.
 * 
 * @module cafesController
 */

import express from "express";
import { Pool } from "pg";
import 'dotenv/config';

/**
 * Türkçe 'İ' karakteri ile başlayan kelimeleri düzeltir
 * Latin ön ek (örn: "ist") → Türkçe ön ek (örn: "İst")
 * 
 * @param {string} latinPrefix - Latin alfabesiyle yazılmış ön ek
 * @returns {string} Türkçe 'İ' ile başlayan ön ek
 */
function turkishUpperIprefix(latinPrefix) {
  if (!latinPrefix || latinPrefix.length === 0) return latinPrefix;
  return `İ${latinPrefix.slice(1)}`;
}

const router = express.Router();
const pool = new Pool(); // connection string should be in .env

// GET /api/cafes/categories - Tüm kategori listesini döner (public)
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, slug, parent_id FROM categories ORDER BY id ASC`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ success: false, message: 'Kategoriler alınamadı.' });
  }
});

// GET /api/cafes
router.get("/", async (req, res) => {
  try {
    const {
      lat,
      lon,
      city,
      district,
      category_id,
      feature_ids: featureIdsRaw,
      min_price,
      max_price,
      min_rating,
      max_rating,
      sortBy,
      q,
    } = req.query;

    const feature_ids = featureIdsRaw ?? req.query['feature_ids[]'];

    // Base Query with Joins (CAFES, LOCATIONS, PRODUCTS)
    let queryStr = `
            SELECT 
                c.id, c.name, c.is_active, c.avg_rating, c.address,
                l.city, l.district, l.latitude, l.longitude,
                COALESCE(MIN(p.price), 0) as min_price,
                COALESCE(MAX(p.price), 0) as max_price,
                COALESCE(
                  (SELECT json_agg(json_build_object('id', f.id, 'name', f.name))
                   FROM cafe_feature_map cfm
                   JOIN cafe_features f ON f.id = cfm.feature_id
                   WHERE cfm.cafe_id = c.id),
                  '[]'::json
                ) AS features
        `;

    const queryParams = [];
    // By default only active cafes are returned. Admin UI can request inactive ones
    // by passing ?include_inactive=true
    const includeInactive = req.query.include_inactive === 'true';
    let whereClauses = [];
    if (!includeInactive) {
      whereClauses.push("c.is_active = TRUE");
    }

    // Mesafe hesaplaması (Haversine formülü veya basit SQL ile mesafe hesabı)
    if (lat && lon) {
      queryStr += `, (
                6371 * acos(
                    cos(radians($1)) * cos(radians(l.latitude)) * 
                    cos(radians(l.longitude) - radians($2)) + 
                    sin(radians($1)) * sin(radians(l.latitude))
                )
            ) AS distance `;
      queryParams.push(lat, lon);
    } else {
      queryStr += `, NULL as distance`;
    }

    queryStr += `
            FROM cafes c
            JOIN locations l ON c.location_id = l.id
            LEFT JOIN products p ON p.cafe_id = c.id
        `;

    // Şehir/ilçe bazlı filtreleme (Kullanıcı konum izni vermezse)
    let paramIndex = queryParams.length + 1;
    if (city) {
      whereClauses.push(`l.city = $${paramIndex++}`);
      queryParams.push(city);
    }
    if (district) {
      whereClauses.push(`l.district = $${paramIndex++}`);
      queryParams.push(district);
    }

    // Arama: ön ek + içerir; Latin "ist/istanbul" → "İst/İstanbul" ile eşleşme
    if (q) {
      const trimmed = String(q).trim();
      const prefixLatin = `${trimmed}%`;
      const prefixTurkish = `${turkishUpperIprefix(trimmed)}%`;
      const contains = `%${trimmed}%`;
      whereClauses.push(`(
            c.name ILIKE $${paramIndex} OR l.city ILIKE $${paramIndex} OR l.district ILIKE $${paramIndex}
            OR c.name ILIKE $${paramIndex + 1} OR l.city ILIKE $${paramIndex + 1} OR l.district ILIKE $${paramIndex + 1}
            OR c.name ILIKE $${paramIndex + 2} OR l.city ILIKE $${paramIndex + 2} OR l.district ILIKE $${paramIndex + 2}
          )`);
      queryParams.push(prefixLatin, prefixTurkish, contains);
      paramIndex += 3;
    }

    // Kategori ID'ye göre filtreleme: Kafenin belirttiğimiz kategoride en az bir ürünü var mı?
    if (category_id) {
      whereClauses.push(`EXISTS (
                SELECT 1 FROM products p2 
                WHERE p2.cafe_id = c.id AND p2.category_id = $${paramIndex++}
            )`);
      queryParams.push(category_id);
    }

    // Feature IDs'e göre filtreleme (Array)
    if (feature_ids) {
      // axios ile gelen parametre "feature_ids[]=1&feature_ids[]=2" array olabilir, tekilse liste yapalım.
      const featureArray = Array.isArray(feature_ids)
        ? feature_ids
        : [feature_ids];
      if (featureArray.length > 0) {
        // Seçilen HER BİR özelliğe sahip mi (AND kurgusu) - EXISTS kullanarak yapıyoruz
        featureArray.forEach((fId) => {
          whereClauses.push(`EXISTS (
                        SELECT 1 FROM cafe_feature_map cfm 
                        WHERE cfm.cafe_id = c.id AND cfm.feature_id = $${paramIndex++}
                    )`);
          queryParams.push(parseInt(fId, 10));
        });
      }
    }

    if (whereClauses.length > 0) {
      queryStr += ` WHERE ` + whereClauses.join(" AND ");
    }

    // Gruplama
    queryStr += ` GROUP BY c.id, c.name, c.is_active, c.avg_rating, c.address, l.city, l.district, l.latitude, l.longitude`;

    // Fiyat Aralığı (HAVING clause kullanımı, çünkü MIN/MAX gruplanmış değerlerdir)
    let havingClauses = [];
    if (min_price) {
      havingClauses.push(`COALESCE(MIN(p.price), 0) >= $${paramIndex++}`);
      queryParams.push(min_price);
    }
    if (max_price) {
      havingClauses.push(`COALESCE(MAX(p.price), 0) <= $${paramIndex++}`);
      queryParams.push(max_price);
    }
    if (min_rating) {
      havingClauses.push(`c.avg_rating >= $${paramIndex++}`);
      queryParams.push(min_rating);
    }
    if (max_rating) {
      havingClauses.push(`c.avg_rating <= $${paramIndex++}`);
      queryParams.push(max_rating);
    }

    if (havingClauses.length > 0) {
      queryStr += ` HAVING ` + havingClauses.join(" AND ");
    }

    // Sıralama (Mesafe öncelikli varsayılan)
    if (sortBy === "price_asc") {
      queryStr += ` ORDER BY min_price ASC`;
    } else if (sortBy === "price_desc") {
      queryStr += ` ORDER BY min_price DESC`;
    } else if (sortBy === "rating_desc") {
      queryStr += ` ORDER BY c.avg_rating DESC NULLS LAST`;
    } else if (sortBy === "rating_asc") {
      queryStr += ` ORDER BY c.avg_rating ASC NULLS LAST`;
    } else if (sortBy === "name_asc") {
      queryStr += ` ORDER BY c.name ASC`;
    } else if (lat && lon) {
      queryStr += ` ORDER BY distance ASC`; // Varsayılan mesafe
    } else {
      queryStr += ` ORDER BY c.name ASC`; // Tamamen varsayılan
    }

    // Hız/Performans: 1.5 sn altında kalması için db index gerekli (latitude, longitude ve is_active)
    const result = await pool.query(queryStr, queryParams);

    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching cafes:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Aktif kampanyalar (kullanıcı menü/kampanya ekranı)
router.get('/:id/campaigns', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, title, description, discount_percent, starts_at, ends_at
       FROM cafe_campaigns
       WHERE cafe_id = $1
         AND is_active = TRUE
         AND CURRENT_DATE BETWEEN starts_at AND ends_at
       ORDER BY ends_at ASC`,
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Cafe campaigns fetch error:', error);
    res.status(500).json({ success: false, message: 'Kampanyalar alınamadı.' });
  }
});

router.get('/:id/menu', async (req, res) => {
  try {
    const { id } = req.params;

    const cafeResult = await pool.query(
      `SELECT c.id, c.name, c.is_active, l.city, l.district
       FROM cafes c
       JOIN locations l ON c.location_id = l.id
       WHERE c.id = $1`,
      [id]
    );

    if (cafeResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Kafe bulunamadı.' });
    }

    const productsResult = await pool.query(
      `SELECT p.id, p.name, p.price, p.currency, p.is_available, cat.name AS category_name, p.updated_at
       FROM products p
       LEFT JOIN categories cat ON p.category_id = cat.id
       WHERE p.cafe_id = $1
       ORDER BY p.updated_at DESC, p.name ASC`,
      [id]
    );

    res.json({
      success: true,
      cafe: cafeResult.rows[0],
      data: productsResult.rows,
    });
  } catch (error) {
    console.error('Cafe menu fetch error:', error);
    res.status(500).json({ success: false, message: 'Menü alınamadı.' });
  }
});

export default router;
