import express from 'express';
import { Pool } from 'pg';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool();

/** Latin klavyede yazılan ön eklerin Türkçe İ ile başlayan şehir/isimlerle eşleşmesi (örn. ist → İstanbul) */
function turkishUpperIprefix(latinPrefix) {
  if (!latinPrefix || latinPrefix.length === 0) return latinPrefix;
  return `İ${latinPrefix.slice(1)}`;
}

// POST /api/ai-search - Akıllı Arama Endpoint'i
router.post('/', async (req, res) => {
  try {
    const { query_text, user_id } = req.body;

    if (!query_text || query_text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Lütfen arama metni giriniz.' });
    }

    const rawQuery = query_text.trim();
    const textToAnalyze = rawQuery.toLowerCase();

    const filters_applied = {
      features: [],
      products: [],
      max_price: null,
      free_text: null,
    };

    // Özellik anahtarları → cafe_features.id (sample_data + pet_friendly ile uyumlu)
    const featureRules = [
      { id: 1, tokens: ['wi-fi', 'wifi', 'wireless'] },
      { id: 2, tokens: ['priz', 'prizli', 'elektrik', 'outlet'] },
      { id: 3, tokens: ['evcil hayvan', 'evcil', 'pet', 'hayvan dostu', 'pati'] },
    ];

    const matchedFeatureIds = new Set();
    featureRules.forEach((rule) => {
      for (const token of rule.tokens) {
        if (textToAnalyze.includes(token)) {
          matchedFeatureIds.add(rule.id);
          filters_applied.features.push(token);
          break;
        }
      }
    });

    // Dinamik ürün tespiti: sorgudaki kelimeleri veritabanındaki ürün isimleriyle eşleştir
    // Kelimelere ayır ve en az 2 karakterli token'ları al
    const tokens = textToAnalyze
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    if (tokens.length > 0) {
      try {
        // Tek sorguda tüm token'lar için products tablosunda arama yap
        const prodParams = tokens.map((t) => `%${t}%`);
        const prodWhere = tokens.map((_, i) => `name ILIKE $${i + 1}`).join(' OR ');
        const prodSql = `SELECT DISTINCT name FROM products WHERE ${prodWhere} LIMIT 200`;
        const prodRes = await pool.query(prodSql, prodParams);

        prodRes.rows.forEach((r) => {
          const pname = (r.name || '').toLowerCase();
          if (pname && !filters_applied.products.includes(pname)) filters_applied.products.push(pname);
        });
      } catch (prodErr) {
        console.error('Ürün tespiti sırasında hata:', prodErr);
      }
    }

    const priceRegex = /(\d+)\s*(?:tl|lira)\s*(?:altı|kadar|maksimum)/i;
    const priceMatch = query_text.match(priceRegex);
    if (priceMatch && priceMatch[1]) {
      filters_applied.max_price = parseInt(priceMatch[1], 10);
    }

    // Konum/isim araması için anahtar kelimeleri metinden çıkar
    let freeText = rawQuery;
    const stripTokens = [
      ...featureRules.flatMap((r) => r.tokens),
      ...filters_applied.products,
    ];
    stripTokens.forEach((t) => {
      if (t.length < 2) return;
      freeText = freeText.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
    });
    freeText = freeText.replace(/\s+/g, ' ').trim();
    // Fiyat ifadesini de kırp
    freeText = freeText.replace(priceRegex, ' ').replace(/\s+/g, ' ').trim();

    if (freeText.length > 0) {
      filters_applied.free_text = freeText;
    }

    let queryParams = [];
    let paramIndex = 1;
    let whereClauses = ['c.is_active = TRUE'];

    if (filters_applied.products.length > 0) {
      const productConditions = filters_applied.products
        .map((p) => {
          queryParams.push(`%${p}%`);
          return `p.name ILIKE $${paramIndex++}`;
        })
        .join(' OR ');

      whereClauses.push(`EXISTS (
                SELECT 1 FROM products p 
                WHERE p.cafe_id = c.id AND (${productConditions})
            )`);
    }

    matchedFeatureIds.forEach((fid) => {
      whereClauses.push(`EXISTS (
                    SELECT 1 FROM cafe_feature_map cfm
                    WHERE cfm.cafe_id = c.id AND cfm.feature_id = $${paramIndex++}
                )`);
      queryParams.push(fid);
    });

    if (filters_applied.max_price) {
      whereClauses.push(`EXISTS (
                SELECT 1 FROM products p
                WHERE p.cafe_id = c.id AND p.price <= $${paramIndex++}
            )`);
      queryParams.push(filters_applied.max_price);
    }

    // İsim / şehir / ilçe: ön ek + içerir (Türkçe İ ile Latin i uyumu)
    const textForLocation = filters_applied.free_text ?? '';
    const hasStructured =
      matchedFeatureIds.size > 0 ||
      filters_applied.products.length > 0 ||
      Boolean(filters_applied.max_price);
    const hasText = textForLocation.length >= 1;

    if (!hasStructured && !hasText) {
      return res.status(400).json({
        success: false,
        message:
          'Arama yeterince net değil. Kafe adı, şehir (ör. ist, istanbul) veya özellik (wifi, priz) yazın.',
      });
    }

    if (textForLocation.length >= 1) {
      const prefixLatin = `${textForLocation}%`;
      const prefixTurkish = turkishUpperIprefix(textForLocation) + '%';
      const contains = `%${textForLocation}%`;

      const locOr = `
        c.name ILIKE $${paramIndex} OR l.city ILIKE $${paramIndex} OR l.district ILIKE $${paramIndex}
        OR c.name ILIKE $${paramIndex + 1} OR l.city ILIKE $${paramIndex + 1} OR l.district ILIKE $${paramIndex + 1}
        OR c.name ILIKE $${paramIndex + 2} OR l.city ILIKE $${paramIndex + 2} OR l.district ILIKE $${paramIndex + 2}
      `;
      whereClauses.push(`(${locOr})`);
      queryParams.push(prefixLatin, prefixTurkish, contains);
      paramIndex += 3;
    }

    const sqlQuery = `
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
            FROM cafes c
            JOIN locations l ON c.location_id = l.id
            LEFT JOIN products p ON p.cafe_id = c.id
            WHERE ${whereClauses.join(' AND ')}
            GROUP BY c.id, c.name, c.is_active, c.avg_rating, c.address, l.city, l.district, l.latitude, l.longitude
            ORDER BY c.avg_rating DESC NULLS LAST, c.name ASC
            LIMIT 100
        `;

    const result = await pool.query(sqlQuery, queryParams);

    let message = 'İsteğinize uygun kafeler bulundu.';
    const cafesFound = result.rows;

    if (cafesFound.length === 0) {
      message =
        'Tam olarak aradığınız kriterlerde kafe bulamadık. Daha fazla sonuç için "fiyat aralığını" genişletmeyi veya bazı "özellikleri" esnetmeyi deneyebilirsiniz.';
    }

    try {
      if (user_id) {
        const logQuery = `
                    INSERT INTO ai_search_history (user_id, query_text, filters_applied, result_snapshot)
                    VALUES ($1, $2, $3, $4)
                `;
        await pool.query(logQuery, [user_id, query_text, JSON.stringify(filters_applied), JSON.stringify(cafesFound)]);
      }
    } catch (logError) {
      console.error('Audit Log Kayıt Hatası (Search History):', logError);
    }

    res.json({
      success: true,
      filters_detected: filters_applied,
      message: message,
      count: cafesFound.length,
      data: cafesFound,
    });
  } catch (error) {
    console.error('Akıllı Arama Hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: Arama motoru şu an servis dışı.' });
  }
});

export default router;
