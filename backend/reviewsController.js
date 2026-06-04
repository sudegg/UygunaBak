/**
 * Yorumlar Kontrolcüsü (Reviews Controller)
 * 
 * Müşteri yorumları ve derecelendirmelerini yönetir. Yorum ekleme/güncelleme,
 * işletme sahibinin yanıt vermesi, yorum raporlaması gibi işlemleri içerir.
 * 
 * Puanlama Algoritması:
 * - %40 Genel Puan
 * - %25 Ürün Kalitesi
 * - %20 Fiyat
 * - %10 Ambiyans
 * - %5 Servis
 * 
 * @module reviewsController
 */

import express from 'express';
import { Pool } from 'pg';
import { verifyToken } from './middleware/auth.js';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool(); // connection string should be in .env

/**
 * POST /api/reviews - Yeni Yorum Ekleme veya Güncelleme
 * 
 * Kullanıcının belirli bir kafeye yorum eklemesini veya var olan yorumunu 
 * güncellemesini sağlar. Aynı kullanıcı tarafından aynı kafe için yalnızca 
 * bir yorum olabilir (UPSERT pattern kullanılır).
 * 
 * Gerekli Parametreler:
 * - cafe_id: Yorum yapılacak kafeye ait ID
 * - comment: Yorum metni (10-1000 karakter)
 * - overall_rating: Genel puan (1-5)
 * 
 * Opsiyonel Parametreler:
 * - product_rating, price_rating, ambiance_rating, service_rating (1-5)
 * 
 * @route POST /api/reviews
 * @middleware verifyToken - Kimlik doğrulama gerekli
 * @param {Object} req.body - Yorum verileri
 * @returns {Object} 201 - Yeni yorum nesnesi
 * @returns {Object} 400 - Validasyon hatası
 * @returns {Object} 500 - Server hatası
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { 
            cafe_id, comment, 
            overall_rating, product_rating, price_rating, ambiance_rating, service_rating 
        } = req.body;
        const user_id = req.user.id;

        // Parametreleri sayıya çevir
        const parsedOverallRating = Number(overall_rating);
        const parsedProductRating = Number(product_rating ?? overall_rating);
        const parsedPriceRating = Number(price_rating ?? overall_rating);
        const parsedAmbianceRating = Number(ambiance_rating ?? overall_rating);
        const parsedServiceRating = Number(service_rating ?? overall_rating);

        // 1. Validasyon: Yorum karakter sınırı
        if (!comment || comment.length < 10 || comment.length > 1000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Yorum 10 ile 1000 karakter arasında olmalıdır.' 
            });
        }

        // 2. Validasyon: Genel puan aralığı
        if (!Number.isFinite(parsedOverallRating) || parsedOverallRating < 1 || parsedOverallRating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: 'Genel puan 1 ile 5 arasında olmalıdır.' 
            });
        }

        // Kategorik puanları normalize et (geçerli değilse genel puanı kullan)
        const normalizedProductRating = Number.isFinite(parsedProductRating) ? parsedProductRating : parsedOverallRating;
        const normalizedPriceRating = Number.isFinite(parsedPriceRating) ? parsedPriceRating : parsedOverallRating;
        const normalizedAmbianceRating = Number.isFinite(parsedAmbianceRating) ? parsedAmbianceRating : parsedOverallRating;
        const normalizedServiceRating = Number.isFinite(parsedServiceRating) ? parsedServiceRating : parsedOverallRating;

        // 3. Ağırlıklı Puan Hesaplaması: %40 Genel, %25 Ürün, %20 Fiyat, %10 Ambiyans, %5 Servis
        const calculated_rating = (
            (parsedOverallRating * 0.40) +
            (normalizedProductRating * 0.25) +
            (normalizedPriceRating * 0.20) +
            (normalizedAmbianceRating * 0.10) +
            (normalizedServiceRating * 0.05)
        ).toFixed(2);

        // 4. Veritabanına Kayıt / Güncelleme (UPSERT)
        // Aynı kullanıcı aynı kafede yorum güncelleyebilir
        const upsertQuery = `
            INSERT INTO reviews (
                user_id, cafe_id, comment, 
                overall_rating, product_rating, price_rating, ambiance_rating, service_rating, 
                calculated_rating, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, cafe_id)
            DO UPDATE SET
                comment = EXCLUDED.comment,
                overall_rating = EXCLUDED.overall_rating,
                product_rating = EXCLUDED.product_rating,
                price_rating = EXCLUDED.price_rating,
                ambiance_rating = EXCLUDED.ambiance_rating,
                service_rating = EXCLUDED.service_rating,
                calculated_rating = EXCLUDED.calculated_rating,
                created_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        
        const reviewData = [
            user_id, cafe_id, comment,
            parsedOverallRating, normalizedProductRating, normalizedPriceRating, normalizedAmbianceRating, normalizedServiceRating,
            calculated_rating
        ];

        const newReview = await pool.query(upsertQuery, reviewData);

        // 5. Kafenin avg_rating değerini güncelle (is_visible = TRUE olanlar)
        // Yorum verileri güncellenince ortalamaların da güncel olması sağlanır
        await pool.query(`
            UPDATE cafes 
            SET avg_rating = (
                SELECT ROUND(AVG(calculated_rating), 1) 
                FROM reviews 
                WHERE cafe_id = $1 AND is_visible = TRUE
            )
            WHERE id = $1
        `, [cafe_id]);

        res.status(201).json({ success: true, data: newReview.rows[0] });

    } catch (error) {
        console.error('Yorum ekleme hatası:', error);
        res.status(500).json({ success: false, message: 'Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.' });
    }
});

// POST /api/reviews/:id/report - Yorumu Şikayet Etme
/**
 * Uygunsuz olarak değerlendirilen yorumları raporlama endpoint'i
 * 3 şikayet alan yorumlar otomatik gizlenir
 * 
 * @route POST /api/reviews/:id/report
 * @param {number} id - Şikayet edilecek yorum ID'si
 * @returns {Object} 200 - Başarılı
 * @returns {Object} 500 - Server hatası
 */
router.post('/:id/report', async (req, res) => {
    try {
        const reviewId = req.params.id;

        // Rapor sayısını artır ve 3'ü geçerse is_visible=false yap
        const reportQuery = `
            UPDATE reviews
            SET
                report_count = report_count + 1,
                is_reported = TRUE,
                is_visible = CASE WHEN report_count + 1 >= 3 THEN FALSE ELSE is_visible END
            WHERE id = $1
            RETURNING cafe_id, is_visible
        `;
        const { rows } = await pool.query(reportQuery, [reviewId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Yorum bulunamadı.' });
        }

        // Eğer görünmez olduysa kafenin ortalama puanını (avg_rating) yeniden hesapla
        if (rows[0].is_visible === false) {
             await pool.query(`
                UPDATE cafes 
                SET avg_rating = (
                    SELECT ROUND(AVG(calculated_rating), 1) 
                    FROM reviews 
                    WHERE cafe_id = $1 AND is_visible = TRUE
                )
                WHERE id = $1
            `, [rows[0].cafe_id]);
        }

        res.json({ success: true, message: 'Şikayet alındı.' });

    } catch (error) {
        console.error('Şikayet hatası:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/cafes/:cafeId/reviews - Yorumları Getir (Kullanıcı Join ile)
router.get('/cafe/:cafeId', async (req, res) => {
    try {
        const { cafeId } = req.params;

        const getReviews = `
            SELECT 
                r.id, r.comment, r.calculated_rating, r.created_at,
                r.owner_reply, r.reply_at,
                u.full_name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.cafe_id = $1 AND r.is_visible = TRUE
            ORDER BY r.created_at DESC
        `;
        
        const { rows } = await pool.query(getReviews, [cafeId]);
        
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Yorumları getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;