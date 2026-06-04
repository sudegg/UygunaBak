-- İzmir, Ankara ve Antalya için ek veriler

-- İzmir lokasyonları
INSERT INTO locations (city, district, latitude, longitude) VALUES
('İzmir', 'Alsancak', 38.4348, 27.1477),
('İzmir', 'Karşıyaka', 38.4592, 27.1147);

-- Ankara lokasyonu
INSERT INTO locations (city, district, latitude, longitude) VALUES
('Ankara', 'Çankaya', 39.9334, 32.8597);

-- Antalya lokasyonu
INSERT INTO locations (city, district, latitude, longitude) VALUES
('Antalya', 'Muratpaşa', 36.8969, 30.7133);

-- Ek işletme hesapları
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Alsancak Owner', 'owner4@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'),
('Karşıyaka Owner', 'owner5@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'),
('Ankara Owner', 'owner6@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner'),
('Antalya Owner', 'owner7@test.com', '$2b$10$XxSgGkkfilj6jAOs62cyRO1CNzrnMjxvWLzULdjZSGwSf/5V7pskq', 'owner');

-- İzmir kafeleri
INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active) VALUES
((SELECT id FROM users WHERE email = 'owner4@test.com'), (SELECT id FROM locations WHERE city = 'İzmir' AND district = 'Alsancak'), 'Alsancak Coffee', 'Alsancak Sahil No:15', '02324654321', 4.3, true),
((SELECT id FROM users WHERE email = 'owner5@test.com'), (SELECT id FROM locations WHERE city = 'İzmir' AND district = 'Karşıyaka'), 'Karşıyaka Brew', 'Karşıyaka Marina No:8', '02323654322', 4.6, true);

-- Ankara kafesi
INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active) VALUES
((SELECT id FROM users WHERE email = 'owner6@test.com'), (SELECT id FROM locations WHERE city = 'Ankara' AND district = 'Çankaya'), 'Ankara Central', 'Çankaya Kızılay No:25', '03124254323', 4.1, true);

-- Antalya kafesi
INSERT INTO cafes (owner_id, location_id, name, address, phone, avg_rating, is_active) VALUES
((SELECT id FROM users WHERE email = 'owner7@test.com'), (SELECT id FROM locations WHERE city = 'Antalya' AND district = 'Muratpaşa'), 'Antalya Beach', 'Muratpaşa Sahil No:12', '02422454324', 4.7, true);

-- Ek ürünler
INSERT INTO products (cafe_id, category_id, name, price, currency, is_available) VALUES
((SELECT id FROM cafes WHERE name = 'Alsancak Coffee'), 1, 'İzmir Kahvesi', 22.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Karşıyaka Brew'), 1, 'Latte', 32.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Ankara Central'), 1, 'Mocha', 38.00, 'TRY', true),
((SELECT id FROM cafes WHERE name = 'Antalya Beach'), 3, 'Fresh Juice', 25.00, 'TRY', true);

-- Özellikler (Ankara Central: Wi‑Fi ve priz yok — örnek)
INSERT INTO cafe_feature_map (cafe_id, feature_id) VALUES
((SELECT id FROM cafes WHERE name = 'Alsancak Coffee'), 1), -- Wi-Fi
((SELECT id FROM cafes WHERE name = 'Karşıyaka Brew'), 1), -- Wi-Fi
((SELECT id FROM cafes WHERE name = 'Karşıyaka Brew'), 2), -- Priz
((SELECT id FROM cafes WHERE name = 'Antalya Beach'), 1), -- Wi-Fi
((SELECT id FROM cafes WHERE name = 'Antalya Beach'), 2); -- Priz

INSERT INTO cafe_reports (cafe_id, reporter_id, report_type, title, description, status)
SELECT
	(SELECT id FROM cafes WHERE name = 'Karşıyaka Brew'),
	(SELECT id FROM users WHERE email = 'owner5@test.com'),
	'Genel Uyarı',
	'İzleme altında',
	'Owner5 tarafından açılan örnek işletme raporu.',
	'open'
WHERE NOT EXISTS (
	SELECT 1 FROM cafe_reports WHERE title = 'İzleme altında'
);