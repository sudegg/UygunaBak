import express from 'express';
import { Pool } from 'pg';
import { verifyToken } from './middleware/auth.js';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool();

// Sadece giriş yapmış kullanıcılar favori ekleyebilir
router.use(verifyToken);

// POST /api/favorites - Favori Ekle / Çıkar (Toggle)
router.post('/', async (req, res) => {
    try {
        const { cafe_id } = req.body;
        const user_id = req.user.id;

        // Önce favorilerde var mı kontrol et
        const checkQuery = await pool.query('SELECT id FROM favorites WHERE user_id = $1 AND cafe_id = $2', [user_id, cafe_id]);

        if (checkQuery.rowCount > 0) {
            // Varsa Sil (Favorilerden çıkar)
            await pool.query('DELETE FROM favorites WHERE id = $1', [checkQuery.rows[0].id]);
            return res.json({ success: true, message: 'Favorilerden çıkarıldı.', is_favorite: false });
        } else {
            // Yoksa Ekle
            const insertQuery = `
                INSERT INTO favorites (user_id, cafe_id) 
                VALUES ($1, $2) RETURNING id
            `;
            await pool.query(insertQuery, [user_id, cafe_id]);
            return res.json({ success: true, message: 'Favorilere eklendi.', is_favorite: true });
        }

    } catch (error) {
        console.error('Favorite Toggle Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

export default router;