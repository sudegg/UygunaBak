-- Örnek veriler ekleme scripti

-- Locations ekle
INSERT INTO locations (city, district, latitude, longitude) VALUES
('İstanbul', 'Kadıköy', 40.9856, 29.0270),
('İstanbul', 'Beşiktaş', 41.0422, 29.0097),
('İstanbul', 'Şişli', 41.0600, 28.9870),
('İstanbul', 'Moda', 40.9833, 29.0250);

-- Kullanıcıları ekle (Şifre: 123456)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Kadıköy Owner', 'owner1@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'),
('Beşiktaş Owner', 'owner2@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'),
('Şişli Owner', 'owner3@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'),
('Test Admin', 'admin@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'admin'),
('Test User', 'user@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'customer');

-- Kafeleri ekle
INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active) VALUES
((SELECT id FROM users WHERE email = 'owner1@test.com'), 1, 'Kadıköy Kahve', 'Kadıköy Meydanı No:1', '02161234567', 4.5, true),
((SELECT id FROM users WHERE email = 'owner1@test.com'), 4, 'Moda Roastery', 'Moda Caddesi No:12', '02161230001', 4.6, true),
((SELECT id FROM users WHERE email = 'owner2@test.com'), 2, 'Beşiktaş Brew', 'Beşiktaş Sahil No:5', '02162345678', 4.2, true),
((SELECT id FROM users WHERE email = 'owner3@test.com'), 3, 'Şişli Coffee', 'Şişli Merkez No:10', '02163456789', 4.8, true);

-- Kategoriler ekle
INSERT INTO categories (name, slug) VALUES
('Kahve', 'kahve'),
('Çay', 'cay'),
('İçecek', 'icecek');

-- Ürünler ekle
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) VALUES
((SELECT id FROM cafes WHERE name = 'Kadıköy Kahve'), 1, 'Türk Kahvesi', 25.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Kadıköy Kahve'), 1, 'Americano', 30.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Moda Roastery'), 1, 'Cold Brew', 34.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Moda Roastery'), 3, 'Iced Latte', 39.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Beşiktaş Brew'), 1, 'Espresso', 28.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Beşiktaş Brew'), 2, 'Çay', 15.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Şişli Coffee'), 1, 'Cappuccino', 35.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Şişli Coffee'), 3, 'Smoothie', 40.00, 'TRY', true);

-- Özellikler ekle
INSERT INTO cafe_features (name, icon) VALUES
('Wi-Fi', 'wifi'),
('Priz', 'bolt');

-- Kafe özelliklerini bağla
INSERT INTO cafe_feature_map (cafe_id, feature_id) VALUES
((SELECT id FROM cafes WHERE name = 'Kadıköy Kahve'), 1),
((SELECT id FROM cafes WHERE name = 'Kadıköy Kahve'), 2),
((SELECT id FROM cafes WHERE name = 'Moda Roastery'), 1),
((SELECT id FROM cafes WHERE name = 'Beşiktaş Brew'), 1),
((SELECT id FROM cafes WHERE name = 'Şişli Coffee'), 1),
((SELECT id FROM cafes WHERE name = 'Şişli Coffee'), 2);

-- Örnek yorum (Test User -> Kadıköy Kahve)
INSERT INTO reviews (
    user_id, cafe_id, comment,
    overall_rating, product_rating, price_rating, ambiance_rating, service_rating,
    calculated_rating, created_at
) VALUES (
    (SELECT id FROM users WHERE email = 'user@test.com'),
    (SELECT id FROM cafes WHERE name = 'Kadıköy Kahve'),
    'Test yorumu: kahve çok güzel, ortam da oldukça rahat.',
    5, 5, 4, 5, 4,
    4.70,
    CURRENT_TIMESTAMP
);

INSERT INTO cafe_reports (cafe_id, reporter_id, report_type, title, description, status)
SELECT
    (SELECT id FROM cafes WHERE name = 'Kadıköy Kahve'),
    (SELECT id FROM users WHERE email = 'owner1@test.com'),
    'Operasyonel Sorun',
    'Servis yoğunluğu kontrol edilmeli',
    'Hafta sonu yoğunluğunda servis süresi belirgin şekilde uzuyor.',
    'in_review'
WHERE NOT EXISTS (
    SELECT 1 FROM cafe_reports WHERE title = 'Servis yoğunluğu kontrol edilmeli'
);

INSERT INTO cafe_reports (cafe_id, reporter_id, report_type, title, description, status)
SELECT
    (SELECT id FROM cafes WHERE name = 'Beşiktaş Brew'),
    (SELECT id FROM users WHERE email = 'owner2@test.com'),
    'Fiyat Güncelleme',
    'Menü fiyatları yenilensin',
    'Bazı menü fiyatları son kampanyalara göre güncellenmeli.',
    'open'
WHERE NOT EXISTS (
    SELECT 1 FROM cafe_reports WHERE title = 'Menü fiyatları yenilensin'
);

-- Ek test yorumları (Her kafede en az 3 yorum olsun)
INSERT INTO reviews (
    user_id, cafe_id, comment,
    overall_rating, product_rating, price_rating, ambiance_rating, service_rating,
    calculated_rating, created_at
) VALUES (
    (SELECT id FROM users WHERE email = 'user@test.com'),
    (SELECT id FROM cafes WHERE name = 'Moda Roastery'),
    'Harika bir kafe! Kahvesi muhteşem, ortamı çok şık. Fiyatlar biraz yüksek ama kalitesi karşılıyor.',
    5, 5, 3, 5, 5,
    4.65,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
);

INSERT INTO reviews (
    user_id, cafe_id, comment,
    overall_rating, product_rating, price_rating, ambiance_rating, service_rating,
    calculated_rating, created_at
) VALUES (
    (SELECT id FROM users WHERE email = 'user@test.com'),
    (SELECT id FROM cafes WHERE name = 'Beşiktaş Brew'),
    'Güzel bir sahil kafesi. Kahveler tatmin edici, personel çok yardımcı.',
    4, 4, 4, 4, 5,
    4.25,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
);

INSERT INTO reviews (
    user_id, cafe_id, comment,
    overall_rating, product_rating, price_rating, ambiance_rating, service_rating,
    calculated_rating, created_at
) VALUES (
    (SELECT id FROM users WHERE email = 'user@test.com'),
    (SELECT id FROM cafes WHERE name = 'Şişli Coffee'),
    'Şişli''in en iyi kafesi! Kahvesi çok lezzetli, ortamı modern ve konforlu.',
    5, 5, 5, 5, 5,
    5.0,
    CURRENT_TIMESTAMP - INTERVAL '3 days'
);

INSERT INTO reviews (
    user_id, cafe_id, comment,
    overall_rating, product_rating, price_rating, ambiance_rating, service_rating,
    calculated_rating, created_at
) VALUES (
    (SELECT id FROM users WHERE email = 'user@test.com'),
    (SELECT id FROM cafes WHERE name = 'Kadıköy Kahve'),
    'Kahve kalitesi iyiydi ama servis çok hızlı gitti. Yine de tavsiye ederim.',
    4, 4, 4, 3, 3,
    3.9,
    CURRENT_TIMESTAMP - INTERVAL '4 days'
);