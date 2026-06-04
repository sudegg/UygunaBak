/**
 * UygunaBak - Ana Sunucu (Main Server)
 * 
 * Express.js tabanlı REST API sunucusu. Tüm API endpoint'lerini tanımlar
 * ve yönetir. CORS, JSON parsing ve diğer middleware'leri yapılandırır.
 * 
 * @version 1.0.0
 * @requires express
 * @requires cors
 * @requires dotenv
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'dotenv/config';

// İç modüller (Internal Routes)
import cafesRoute from './cafesController.js';
import reviewsRoute from './reviewsController.js';
import aiSearchRoute from './aiSearchController.js';
import ownerRoute from './ownerController.js';
import favoritesRoute from './favoritesController.js';
import authRoute from './authController.js';
import adminRoute from './adminController.js';
import { initializeDatabase } from './dbInit.js';

// Ortam değişkenlerini yükle
dotenv.config();
const app = express();

// Query parser yapılandırması
// axios dizi parametrelerini `feature_ids[]=1&feature_ids[]=2` şeklinde gönderir
// bu sebeple 'extended' parser kullanılmalı, aksi takdirde filtreler uygulanmaz
app.set('query parser', 'extended');

// Veritabanını başlat (SQL şemasını ve seed verisini yükle)
initializeDatabase();

// Middleware yapılandırması
/**
 * CORS (Cross-Origin Resource Sharing)
 * Frontend uygulamasının farklı origin'den API çağrılarını yapmasını izin ver
 */
app.use(cors());

/**
 * JSON body parser
 * POST/PUT request'lerindeki JSON verilerini parse et
 */
app.use(express.json());

// API Endpoint'lerinin Bağlanması
/**
 * Kafe listeleme ve filtreleme endpoint'leri
 * GET: kafeler listesi
 * POST: admin işlemleri
 */
app.use('/api/cafes', cafesRoute);

/**
 * Yorum ve derecelendirme endpoint'leri
 * GET: kafeye ait yorumları getir
 * POST: yorum ekle/güncelle
 */
app.use('/api/reviews', reviewsRoute);

/**
 * AI destekli arama endpoint'i
 * POST: doğal dil ile arama yap
 */
app.use('/api/ai-search', aiSearchRoute);

/**
 * İşletme sahibi kontrol paneli endpoint'leri
 * GET: dashboard verileri
 * PUT: kafe bilgilerini güncelle
 * POST: ürün/kampanya ekleme işlemleri
 */
app.use('/api/owner', ownerRoute);

/**
 * Yönetici paneli endpoint'leri
 * GET: sistem analitiği
 * PUT: kafe onayı ve diğer admin işlemleri
 */
app.use('/api/admin', adminRoute);

/**
 * Favori kafeler endpoint'leri
 * GET: kullanıcı favorileri
 * POST: favoriye ekle
 * DELETE: favoridan çıkar
 */
app.use('/api/favorites', favoritesRoute);

/**
 * Kimlik doğrulama endpoint'leri
 * POST: kayıt, giriş ve token yenileme
 */
app.use('/api/auth', authRoute);

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend sunucusu http://localhost:${PORT} portunda çalışıyor 🚀`);
    console.log(`📦 Ortam: ${process.env.NODE_ENV || 'development'}`);
});
