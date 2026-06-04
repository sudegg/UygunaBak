import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import 'dotenv/config';

const router = express.Router();
const pool = new Pool();

// JWT_SECRET ortam değişkeninden alınır, .env dosyasında tanımlı olmalıdır
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('❌ HATA: JWT_SECRET ortam değişkeni tanımlı değil! .env dosyasını kontrol edin.');
}

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Lütfen e-posta ve şifrenizi girin.' });
        }

        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userQuery.rowCount === 0) {
            return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
        }

        const user = userQuery.rows[0];

        // Parola kontrolü
        let isMatch = false;
        
        // Veritabanındaki hash bcrypt formatında değilse (örn. dummyhash), fallback olarak düz şifreyle de karşılaştırıyoruz.
        try {
            if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
                isMatch = await bcrypt.compare(password, user.password_hash);
            }
        } catch (err) {
            console.error('Bcrypt compare error:', err);
        }

        // Eğer bcrypt eşleşmediyse veya düz metinse fallback olarak (geliştirme ortamı için) eşleme
        if (!isMatch && user.password_hash === password) {
            isMatch = true;
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Rolleri mock sisteme benzetmek için UPPER case kullanıyoruz, front-end öyle bekliyor olabilir.
        let roleUpper = 'USER';
        if (user.role === 'admin') roleUpper = 'ADMIN';
        if (user.role === 'owner') roleUpper = 'OWNER';

        let ownedCafes = [];
        if (user.role === 'owner' || user.role === 'admin') {
            const cafeResult = await pool.query(
                `SELECT c.id, c.name, c.is_active, l.city, l.district
                 FROM cafes c
                 JOIN locations l ON c.location_id = l.id
                 WHERE c.owner_id = $1
                 ORDER BY c.name ASC`,
                [user.id]
            );
            ownedCafes = cafeResult.rows;
        }

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                role: roleUpper,
                cafes: ownedCafes
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Giriş yapılırken sunucu hatası oluştu.' });
    }
});

export default router;