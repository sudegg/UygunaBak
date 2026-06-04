-- =====================================================================
-- Zengin kafe ve menü verisi (idempotent — güvenle tekrar çalıştırılabilir)
-- Önce: database.sql, sample_data.sql, more_cities.sql, pet_friendly.sql
-- =====================================================================

-- ---------- Ek kategoriler ----------
INSERT INTO categories (name, slug)
SELECT 'Kahvaltı', 'kahvalti' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'kahvalti');
INSERT INTO categories (name, slug)
SELECT 'Tatlı', 'tatli' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tatli');
INSERT INTO categories (name, slug)
SELECT 'Sandviç', 'sandvic' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sandvic');
INSERT INTO categories (name, slug)
SELECT 'Atıştırmalık', 'atistirmalik' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'atistirmalik');
INSERT INTO categories (name, slug)
SELECT 'Soğuk Kahve', 'soguk-kahve' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'soguk-kahve');

-- ---------- Ek lokasyonlar ----------
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'İstanbul', 'Beyoğlu', 41.0369, 28.9850 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'İstanbul' AND district = 'Beyoğlu');
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'İstanbul', 'Galata', 41.0256, 28.9744 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'İstanbul' AND district = 'Galata');
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'İstanbul', 'Nişantaşı', 41.0520, 28.9874 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'İstanbul' AND district = 'Nişantaşı');
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'İstanbul', 'Üsküdar', 41.0228, 29.0153 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'İstanbul' AND district = 'Üsküdar');
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'İstanbul', 'Cihangir', 41.0322, 28.9817 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'İstanbul' AND district = 'Cihangir');
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'İstanbul', 'Bakırköy', 40.9833, 28.8667 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'İstanbul' AND district = 'Bakırköy');
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'Bursa', 'Osmangazi', 40.1826, 29.0665 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Bursa' AND district = 'Osmangazi');
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'Eskişehir', 'Odunpazarı', 39.7767, 30.5206 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'Eskişehir' AND district = 'Odunpazarı');
INSERT INTO locations (city, district, latitude, longitude)
SELECT 'İzmir', 'Urla', 38.3239, 26.7676 WHERE NOT EXISTS (SELECT 1 FROM locations WHERE city = 'İzmir' AND district = 'Urla');

-- ---------- Yeni işletme hesapları (şifre diğer test hesaplarıyla aynı: 123456) ----------
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Perla Sahibi', 'owner8@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner8@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Galata Sahibi', 'owner9@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner9@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Nişantaşı Sahibi', 'owner10@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner10@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Velvet Sahibi', 'owner11@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner11@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Üsküdar Sahibi', 'owner12@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner12@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Cihangir Sahibi', 'owner13@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner13@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Bakırköy Sahibi', 'owner14@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner14@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Bursa Sahibi', 'owner15@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner15@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Eskişehir Sahibi', 'owner16@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner16@test.com');
INSERT INTO users (full_name, email, password_hash, role)
SELECT 'Urla Sahibi', 'owner17@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner17@test.com');

-- ---------- Yeni kafeler ----------
INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner8@test.com'),
       (SELECT id FROM locations WHERE city = 'İstanbul' AND district = 'Beyoğlu'),
       'Perla Espresso Bar',
       'İstiklal Caddesi Tünel Çıkışı No:14 Kat:1, Beyoğlu',
       '0212 555 01 01',
       4.6, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Perla Espresso Bar');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner9@test.com'),
       (SELECT id FROM locations WHERE city = 'İstanbul' AND district = 'Galata'),
       'Galata Fincanı Speciality Coffee',
       'Galata Kulesi Sokak No:22, Beyoğlu',
       '0212 555 02 02',
       4.7, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Galata Fincanı Speciality Coffee');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner10@test.com'),
       (SELECT id FROM locations WHERE city = 'İstanbul' AND district = 'Nişantaşı'),
       'Nişantaşı Brunch & Brew',
        'Teşvikiye Caddesi No:118 D:3, Nişantaşı',
       '0212 555 03 03',
       4.8, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Nişantaşı Brunch & Brew');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner11@test.com'),
       (SELECT id FROM locations WHERE city = 'İstanbul' AND district = 'Kadıköy'),
       'Velvet Latte Lab',
       'Caferağa Mahallesi Moda Caddesi No:88, Kadıköy',
       '0216 555 04 04',
       4.5, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Velvet Latte Lab');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner12@test.com'),
       (SELECT id FROM locations WHERE city = 'İstanbul' AND district = 'Üsküdar'),
       'Çınaraltı Kahve Atölyesi',
       'Mimar Sinan Mah. Şemsipaşa İskele Sk. No:7, Üsküdar',
       '0216 555 05 05',
       4.4, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Çınaraltı Kahve Atölyesi');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner13@test.com'),
       (SELECT id FROM locations WHERE city = 'İstanbul' AND district = 'Cihangir'),
       'Nar Kütüphane Kahvesi',
       'Akarsu Yokuşu No:21, Beyoğlu',
       '0212 555 06 06',
       4.5, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Nar Kütüphane Kahvesi');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner14@test.com'),
       (SELECT id FROM locations WHERE city = 'İstanbul' AND district = 'Bakırköy'),
       'Sahil Kırıntısı Cafe',
       'Ataköy Marina Rıhtım No:4, Bakırköy',
       '0212 555 07 07',
       4.2, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Sahil Kırıntısı Cafe');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner15@test.com'),
       (SELECT id FROM locations WHERE city = 'Bursa' AND district = 'Osmangazi'),
       'Yeşil Ulu Çınar Kahvehanesi',
       'Ulu Cami Yanı Han 2. Kat Osmangazi',
       '0224 555 08 08',
       4.6, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Yeşil Ulu Çınar Kahvehanesi');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner16@test.com'),
       (SELECT id FROM locations WHERE city = 'Eskişehir' AND district = 'Odunpazarı'),
       'Porsuk Espresso Lab',
       'Arifiye Mah. Doktorlar Sokak No:9, Odunpazarı',
       '0222 555 09 09',
       4.7, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Porsuk Espresso Lab');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner17@test.com'),
       (SELECT id FROM locations WHERE city = 'İzmir' AND district = 'Urla'),
       'Urla Bağ Rotasyon Roastery',
       'Özbek Yolu No:45 Urla Bağ Yolu',
       '0232 555 10 10',
       4.9, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Urla Bağ Rotasyon Roastery');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner8@test.com'),
       (SELECT id FROM locations WHERE city = 'İstanbul' AND district = 'Moda'),
       'Moda Sahil Fırın & Kahve',
       'Moda Sahil Yolu No:3, Kadıköy',
       '0216 555 11 11',
       4.3, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Moda Sahil Fırın & Kahve');

INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active)
SELECT (SELECT id FROM users WHERE email = 'owner4@test.com'),
       (SELECT id FROM locations WHERE city = 'İzmir' AND district = 'Alsancak'),
       'Kordon Liman Kahvesi',
       'Kordon Boyu No:201 Alsancak',
       '0232 555 12 12',
       4.5, true
WHERE NOT EXISTS (SELECT 1 FROM cafes WHERE name = 'Kordon Liman Kahvesi');

-- ---------- Özellik haritaları (3 = evcil hayvan — pet_friendly.sql sonrası) ----------
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, 1 FROM cafes c WHERE c.name = 'Perla Espresso Bar' ON CONFLICT DO NOTHING;
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, 2 FROM cafes c WHERE c.name = 'Perla Espresso Bar' ON CONFLICT DO NOTHING;
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, 1 FROM cafes c WHERE c.name IN ('Galata Fincanı Speciality Coffee', 'Nişantaşı Brunch & Brew', 'Velvet Latte Lab', 'Nar Kütüphane Kahvesi', 'Porsuk Espresso Lab', 'Urla Bağ Rotasyon Roastery', 'Kordon Liman Kahvesi')
ON CONFLICT DO NOTHING;
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, 2 FROM cafes c WHERE c.name IN ('Galata Fincanı Speciality Coffee', 'Nişantaşı Brunch & Brew', 'Velvet Latte Lab', 'Çınaraltı Kahve Atölyesi', 'Urla Bağ Rotasyon Roastery')
ON CONFLICT DO NOTHING;
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, 3 FROM cafes c WHERE c.name IN ('Nişantaşı Brunch & Brew', 'Velvet Latte Lab', 'Moda Sahil Fırın & Kahve', 'Urla Bağ Rotasyon Roastery')
ON CONFLICT DO NOTHING;
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, 1 FROM cafes c WHERE c.name IN ('Çınaraltı Kahve Atölyesi', 'Sahil Kırıntısı Cafe', 'Yeşil Ulu Çınar Kahvehanesi', 'Moda Sahil Fırın & Kahve')
ON CONFLICT DO NOTHING;
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, 2 FROM cafes c WHERE c.name IN ('Sahil Kırıntısı Cafe', 'Yeşil Ulu Çınar Kahvehanesi', 'Moda Sahil Fırın & Kahve')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Menü ürünleri: (cafe, kategori_slug, ürün, fiyat) — NOT EXISTS ile tekil
-- =====================================================================

-- Mevcut kafeleri zenginleştir
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Flat White', 92.00, 'TRY', true FROM cafes c WHERE c.name = 'Kadıköy Kahve'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Flat White');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Cortado', 88.00, 'TRY', true FROM cafes c WHERE c.name = 'Kadıköy Kahve'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Cortado');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'soguk-kahve'), 'Cold Brew Tonic', 110.00, 'TRY', true FROM cafes c WHERE c.name = 'Kadıköy Kahve'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Cold Brew Tonic');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Klasik Tost (Kaşar-Sucuk)', 145.00, 'TRY', true FROM cafes c WHERE c.name = 'Kadıköy Kahve'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Klasik Tost (Kaşar-Sucuk)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'San Sebastian Cheesecake', 165.00, 'TRY', true FROM cafes c WHERE c.name = 'Kadıköy Kahve'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'San Sebastian Cheesecake');

INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'V60 Pour Over', 105.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Roastery'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'V60 Pour Over');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Ethiopia Yirgacheffe Espresso', 95.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Roastery'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Ethiopia Yirgacheffe Espresso');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'soguk-kahve'), 'Kyoto Style Cold Brew', 125.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Roastery'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Kyoto Style Cold Brew');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Çikolatalı Brownie', 95.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Roastery'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Çikolatalı Brownie');

INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Piccolo Latte', 85.00, 'TRY', true FROM cafes c WHERE c.name = 'Beşiktaş Brew'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Piccolo Latte');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Macchiato', 80.00, 'TRY', true FROM cafes c WHERE c.name = 'Beşiktaş Brew'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Macchiato');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'icecek'), 'Ev Yapımı Limonata', 75.00, 'TRY', true FROM cafes c WHERE c.name = 'Beşiktaş Brew'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Ev Yapımı Limonata');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Avokado & Soslu Tam Buğday Sandviç', 195.00, 'TRY', true FROM cafes c WHERE c.name = 'Beşiktaş Brew'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Avokado & Soslu Tam Buğday Sandviç');

INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Flat White (Oat)', 112.00, 'TRY', true FROM cafes c WHERE c.name = 'Şişli Coffee'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Flat White (Oat)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Rose Latte', 118.00, 'TRY', true FROM cafes c WHERE c.name = 'Şişli Coffee'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Rose Latte');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahvalti'), 'Granola Bowl (Yoğurt-Ballı)', 185.00, 'TRY', true FROM cafes c WHERE c.name = 'Şişli Coffee'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Granola Bowl (Yoğurt-Ballı)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Fıstıklı Baklava (2 Dilim)', 220.00, 'TRY', true FROM cafes c WHERE c.name = 'Şişli Coffee'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Fıstıklı Baklava (2 Dilim)');

INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Ristretto', 72.00, 'TRY', true FROM cafes c WHERE c.name = 'Alsancak Coffee'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Ristretto');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'icecek'), 'Mojito (Alkolsüz)', 95.00, 'TRY', true FROM cafes c WHERE c.name = 'Alsancak Coffee'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Mojito (Alkolsüz)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'atistirmalik'), 'Zeytinyağlı Enginar', 140.00, 'TRY', true FROM cafes c WHERE c.name = 'Alsancak Coffee'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Zeytinyağlı Enginar');

INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Brezilya Filtre Kahve', 98.00, 'TRY', true FROM cafes c WHERE c.name = 'Karşıyaka Brew'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Brezilya Filtre Kahve');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Karışık Tost Menü (Patates kızartması ile)', 175.00, 'TRY', true FROM cafes c WHERE c.name = 'Karşıyaka Brew'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Karışık Tost Menü (Patates kızartması ile)');

INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Filtre Kahve (Günün Çekirdeği)', 65.00, 'TRY', true FROM cafes c WHERE c.name = 'Ankara Central'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Filtre Kahve (Günün Çekirdeği)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahvalti'), 'Omlet & Peynir Tabağı', 210.00, 'TRY', true FROM cafes c WHERE c.name = 'Ankara Central'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Omlet & Peynir Tabağı');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'cay'), 'Bitki Çayı (Ihlamur)', 45.00, 'TRY', true FROM cafes c WHERE c.name = 'Ankara Central'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Bitki Çayı (Ihlamur)');

INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'icecek'), 'Karpuz-Fesleğen Smoothie', 135.00, 'TRY', true FROM cafes c WHERE c.name = 'Antalya Beach'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Karpuz-Fesleğen Smoothie');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available)
SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Akdeniz Tabağı Sandviç', 185.00, 'TRY', true FROM cafes c WHERE c.name = 'Antalya Beach'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Akdeniz Tabağı Sandviç');

-- ---- Perla Espresso Bar ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Double Espresso', 78.00, 'TRY', true FROM cafes c WHERE c.name = 'Perla Espresso Bar' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Double Espresso');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Magic (Ristretto + Sıcak Süt)', 95.00, 'TRY', true FROM cafes c WHERE c.name = 'Perla Espresso Bar' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Magic (Ristretto + Sıcak Süt)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Colombia Honey Process Filtre', 115.00, 'TRY', true FROM cafes c WHERE c.name = 'Perla Espresso Bar' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Colombia Honey Process Filtre');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'soguk-kahve'), 'Nitro Cold Brew', 135.00, 'TRY', true FROM cafes c WHERE c.name = 'Perla Espresso Bar' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Nitro Cold Brew');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Trüflü Peynirli Brioche Sandviç', 215.00, 'TRY', true FROM cafes c WHERE c.name = 'Perla Espresso Bar' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Trüflü Peynirli Brioche Sandviç');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'İtalyan Tiramisu', 155.00, 'TRY', true FROM cafes c WHERE c.name = 'Perla Espresso Bar' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'İtalyan Tiramisu');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'icecek'), 'Sparkling Hibiscus', 88.00, 'TRY', true FROM cafes c WHERE c.name = 'Perla Espresso Bar' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Sparkling Hibiscus');

-- ---- Galata Fincanı ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Single Origin Espresso', 92.00, 'TRY', true FROM cafes c WHERE c.name = 'Galata Fincanı Speciality Coffee' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Single Origin Espresso');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Aeropress (Günün Çekirdeği)', 125.00, 'TRY', true FROM cafes c WHERE c.name = 'Galata Fincanı Speciality Coffee' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Aeropress (Günün Çekirdeği)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Rafine Cappuccino (panela sütü)', 108.00, 'TRY', true FROM cafes c WHERE c.name = 'Galata Fincanı Speciality Coffee' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Rafine Cappuccino (panela sütü)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'soguk-kahve'), 'Espresso Tonic (Portakallı)', 115.00, 'TRY', true FROM cafes c WHERE c.name = 'Galata Fincanı Speciality Coffee' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Espresso Tonic (Portakallı)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Galata Kulesi Soufflé', 175.00, 'TRY', true FROM cafes c WHERE c.name = 'Galata Fincanı Speciality Coffee' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Galata Kulesi Soufflé');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'atistirmalik'), 'Kurşuni Fırın Kurabiye (5''li)', 85.00, 'TRY', true FROM cafes c WHERE c.name = 'Galata Fincanı Speciality Coffee' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Kurşuni Fırın Kurabiye (5''li)');

-- ---- Nişantaşı Brunch & Brew ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahvalti'), 'Full English (Yumurta, sucuk, fasulye, mantar)', 385.00, 'TRY', true FROM cafes c WHERE c.name = 'Nişantaşı Brunch & Brew' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Full English (Yumurta, sucuk, fasulye, mantar)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahvalti'), 'Avokado Poşe Yumurta (Ekşi maya)', 295.00, 'TRY', true FROM cafes c WHERE c.name = 'Nişantaşı Brunch & Brew' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Avokado Poşe Yumurta (Ekşi maya)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Brunch Özel Filter Coffee', 95.00, 'TRY', true FROM cafes c WHERE c.name = 'Nişantaşı Brunch & Brew' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Brunch Özel Filter Coffee');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Badem Sütü Latte', 125.00, 'TRY', true FROM cafes c WHERE c.name = 'Nişantaşı Brunch & Brew' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Badem Sütü Latte');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'icecek'), 'Taze Sıkılmış Portakal', 135.00, 'TRY', true FROM cafes c WHERE c.name = 'Nişantaşı Brunch & Brew' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Taze Sıkılmış Portakal');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Fransız Krep (Nutella-Ceviz)', 165.00, 'TRY', true FROM cafes c WHERE c.name = 'Nişantaşı Brunch & Brew' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Fransız Krep (Nutella-Ceviz)');

-- ---- Velvet Latte Lab ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Velvet Latte (Çikolata notası)', 118.00, 'TRY', true FROM cafes c WHERE c.name = 'Velvet Latte Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Velvet Latte (Çikolata notası)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Matcha Latte', 128.00, 'TRY', true FROM cafes c WHERE c.name = 'Velvet Latte Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Matcha Latte');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'soguk-kahve'), 'Frappe (Espresso bazlı)', 112.00, 'TRY', true FROM cafes c WHERE c.name = 'Velvet Latte Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Frappe (Espresso bazlı)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Vegan Falafel Wrap', 175.00, 'TRY', true FROM cafes c WHERE c.name = 'Velvet Latte Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Vegan Falafel Wrap');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Lotus Cheesecake Dilimi', 142.00, 'TRY', true FROM cafes c WHERE c.name = 'Velvet Latte Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Lotus Cheesecake Dilimi');

-- ---- Çınaraltı Kahve Atölyesi ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Bol Köpüklü Türk Kahvesi', 55.00, 'TRY', true FROM cafes c WHERE c.name = 'Çınaraltı Kahve Atölyesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Bol Köpüklü Türk Kahvesi');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Damla Sakızlı Türk Kahvesi', 65.00, 'TRY', true FROM cafes c WHERE c.name = 'Çınaraltı Kahve Atölyesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Damla Sakızlı Türk Kahvesi');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'cay'), 'Sultan Çayı (Uzakdoğu karışımı)', 72.00, 'TRY', true FROM cafes c WHERE c.name = 'Çınaraltı Kahve Atölyesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Sultan Çayı (Uzakdoğu karışımı)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'atistirmalik'), 'Lokum Tabağı (Karışık)', 95.00, 'TRY', true FROM cafes c WHERE c.name = 'Çınaraltı Kahve Atölyesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Lokum Tabağı (Karışık)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Köfte Ekmek (Yarım)', 165.00, 'TRY', true FROM cafes c WHERE c.name = 'Çınaraltı Kahve Atölyesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Köfte Ekmek (Yarım)');

-- ---- Nar Kütüphane Kahvesi ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Chemex (2 Kişilik)', 145.00, 'TRY', true FROM cafes c WHERE c.name = 'Nar Kütüphane Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Chemex (2 Kişilik)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Honey Latte', 108.00, 'TRY', true FROM cafes c WHERE c.name = 'Nar Kütüphane Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Honey Latte');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'cay'), 'Masala Chai Latte', 98.00, 'TRY', true FROM cafes c WHERE c.name = 'Nar Kütüphane Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Masala Chai Latte');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Elmali Tart', 115.00, 'TRY', true FROM cafes c WHERE c.name = 'Nar Kütüphane Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Elmali Tart');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'atistirmalik'), 'Kitap Kulübü Kurabiye Kutusu', 110.00, 'TRY', true FROM cafes c WHERE c.name = 'Nar Kütüphane Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Kitap Kulübü Kurabiye Kutusu');

-- ---- Sahil Kırıntısı ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Buzlu Latte', 98.00, 'TRY', true FROM cafes c WHERE c.name = 'Sahil Kırıntısı Cafe' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Buzlu Latte');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'icecek'), 'Frozen Mango Smoothie', 125.00, 'TRY', true FROM cafes c WHERE c.name = 'Sahil Kırıntısı Cafe' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Frozen Mango Smoothie');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Çıtır Tavuk Burger', 225.00, 'TRY', true FROM cafes c WHERE c.name = 'Sahil Kırıntısı Cafe' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Çıtır Tavuk Burger');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Kalamar Tava (Yanında sos)', 245.00, 'TRY', true FROM cafes c WHERE c.name = 'Sahil Kırıntısı Cafe' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Kalamar Tava (Yanında sos)');

-- ---- Yeşil Ulu Çınar Kahvehanesi (Bursa) ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Osmanlı Dibek Kahvesi', 70.00, 'TRY', true FROM cafes c WHERE c.name = 'Yeşil Ulu Çınar Kahvehanesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Osmanlı Dibek Kahvesi');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Menengiç Kahvesi', 68.00, 'TRY', true FROM cafes c WHERE c.name = 'Yeşil Ulu Çınar Kahvehanesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Menengiç Kahvesi');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'cay'), 'Rize Demlik Çay (Kişilik)', 35.00, 'TRY', true FROM cafes c WHERE c.name = 'Yeşil Ulu Çınar Kahvehanesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Rize Demlik Çay (Kişilik)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Keşkül', 85.00, 'TRY', true FROM cafes c WHERE c.name = 'Yeşil Ulu Çınar Kahvehanesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Keşkül');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Tahin Helvası (Dondurmalı)', 95.00, 'TRY', true FROM cafes c WHERE c.name = 'Yeşil Ulu Çınar Kahvehanesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Tahin Helvası (Dondurmalı)');

-- ---- Porsuk Espresso Lab ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Kenya AA Syphon', 155.00, 'TRY', true FROM cafes c WHERE c.name = 'Porsuk Espresso Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Kenya AA Syphon');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Guatemala Espresso', 88.00, 'TRY', true FROM cafes c WHERE c.name = 'Porsuk Espresso Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Guatemala Espresso');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'soguk-kahve'), 'Shakerato', 98.00, 'TRY', true FROM cafes c WHERE c.name = 'Porsuk Espresso Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Shakerato');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahvalti'), 'Üniversite Kahvaltısı (Serpme)', 245.00, 'TRY', true FROM cafes c WHERE c.name = 'Porsuk Espresso Lab' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Üniversite Kahvaltısı (Serpme)');

-- ---- Urla Bağ Rotasyon ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Şarap Fıçında Dinlendirilmiş Cold Brew', 165.00, 'TRY', true FROM cafes c WHERE c.name = 'Urla Bağ Rotasyon Roastery' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Şarap Fıçında Dinlendirilmiş Cold Brew');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Single Estate Espresso Flight (3x)', 195.00, 'TRY', true FROM cafes c WHERE c.name = 'Urla Bağ Rotasyon Roastery' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Single Estate Espresso Flight (3x)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'icecek'), 'Ev Yapımı Üzüm Şırası', 75.00, 'TRY', true FROM cafes c WHERE c.name = 'Urla Bağ Rotasyon Roastery' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Ev Yapımı Üzüm Şırası');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Üzüm Reçelli Scone', 92.00, 'TRY', true FROM cafes c WHERE c.name = 'Urla Bağ Rotasyon Roastery' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Üzüm Reçelli Scone');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Köy Peynirli Focaccia', 175.00, 'TRY', true FROM cafes c WHERE c.name = 'Urla Bağ Rotasyon Roastery' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Köy Peynirli Focaccia');

-- ---- Moda Sahil Fırın & Kahve ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Cortado', 90.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Sahil Fırın & Kahve' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Cortado');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Filtre Kahve (Moda harmanı)', 85.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Sahil Fırın & Kahve' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Filtre Kahve (Moda harmanı)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Ekşi Mayalı Sourdough (Tam buğday)', 75.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Sahil Fırın & Kahve' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Ekşi Mayalı Sourdough (Tam buğday)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'tatli'), 'Frambuazlı Croissant', 95.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Sahil Fırın & Kahve' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Frambuazlı Croissant');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahvalti'), 'Açık Büfe Kahvaltı (Hafta sonu)', 420.00, 'TRY', true FROM cafes c WHERE c.name = 'Moda Sahil Fırın & Kahve' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Açık Büfe Kahvaltı (Hafta sonu)');

-- ---- Kordon Liman Kahvesi ----
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Americano', 88.00, 'TRY', true FROM cafes c WHERE c.name = 'Kordon Liman Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Americano');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'kahve'), 'Latte Art Workshop (İçecek dahil)', 195.00, 'TRY', true FROM cafes c WHERE c.name = 'Kordon Liman Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Latte Art Workshop (İçecek dahil)');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'soguk-kahve'), 'İzmir Limonlu Cold Brew', 118.00, 'TRY', true FROM cafes c WHERE c.name = 'Kordon Liman Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'İzmir Limonlu Cold Brew');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'sandvic'), 'Boyoz (Tereyağlı) & Peynir', 125.00, 'TRY', true FROM cafes c WHERE c.name = 'Kordon Liman Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Boyoz (Tereyağlı) & Peynir');
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) SELECT c.id, (SELECT id FROM categories WHERE slug = 'icecek'), 'Grapefruit Rosemary Spritz', 105.00, 'TRY', true FROM cafes c WHERE c.name = 'Kordon Liman Kahvesi' AND NOT EXISTS (SELECT 1 FROM products p WHERE p.cafe_id = c.id AND p.name = 'Grapefruit Rosemary Spritz');
