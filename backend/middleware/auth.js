/**
 * Kimlik Doğrulama Middleware'leri
 * 
 * JWT (JSON Web Token) kullanarak kullanıcı kimliğini doğrular ve
 * rol bazlı yetkilendirme kontrolleri yapar.
 * 
 * @module middleware/auth
 */

import jwt from 'jsonwebtoken';
import 'dotenv/config';

// JWT_SECRET ortam değişkeninden alınır, .env dosyasında tanımlı olmalıdır
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('❌ HATA: JWT_SECRET ortam değişkeni tanımlı değil! .env dosyasını kontrol edin.');
}

/**
 * JWT Token Doğrulama Middleware'i
 * 
 * Authorization header'daki Bearer token'ı kontrol eder ve geçerliliğini doğrular.
 * Geçerliyse req.user nesnesine token verilerini ekler.
 * 
 * Kullanım:
 * - router.get('/protected', verifyToken, controllerFunction)
 * 
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Bir sonraki middleware'e geç
 * @returns {void} - Başarılı ise next() çağrılır, aksi takdirde error response döner
 */
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Erişim reddedildi. Token bulunamadı.' 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // JWT'yi doğrula ve decode et
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email, role, vb. } - controller'da kullanılabilir
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Geçersiz veya süresi dolmuş token.' 
        });
    }
};

/**
 * İşletme Sahibi Rol Yetkilendirmesi Middleware'i
 * 
 * verifyToken'dan sonra kullanılmalı. Kullanıcının 'owner' rolüne 
 * sahip olup olmadığını kontrol eder.
 * 
 * Kullanım:
 * - router.put('/owner/update', verifyToken, requireOwner, controllerFunction)
 * 
 * @param {Object} req - Express request nesnesi (req.user gereklidir)
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Bir sonraki middleware'e geç
 * @returns {void} - Role sahipse next() çağrılır, aksi takdirde 403 döner
 */
export const requireOwner = (req, res, next) => {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({ 
            success: false, 
            message: 'Bu işlem için İşletme Sahibi (Owner) yetkisine sahip olmalısınız.' 
        });
    }
    next();
};

/**
 * Yönetici Rol Yetkilendirmesi Middleware'i
 * 
 * verifyToken'dan sonra kullanılmalı. Kullanıcının 'admin' rolüne 
 * sahip olup olmadığını kontrol eder.
 * 
 * Kullanım:
 * - router.delete('/admin/cafe/:id', verifyToken, requireAdmin, controllerFunction)
 * 
 * @param {Object} req - Express request nesnesi (req.user gereklidir)
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Bir sonraki middleware'e geç
 * @returns {void} - Role sahipse next() çağrılır, aksi takdirde 403 döner
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Bu işlem için Admin yetkisine sahip olmalısınız.' 
        });
    }
    next();
};
