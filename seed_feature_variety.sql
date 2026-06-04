-- Filtre testi: kafeler arasında özellik farkları (idempotent güvenli eklemeler)
-- sample_data.sql + more_cities.sql + pet_friendly.sql sonrası çalıştırın.

-- Beşiktaş Brew: yalnızca Wi-Fi idi → priz de eklenir (Wi-Fi + Priz)
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, 2
FROM cafes c
WHERE c.name = 'Beşiktaş Brew'
ON CONFLICT DO NOTHING;

-- Moda Roastery: yalnızca Wi-Fi kalsın (zaten öyle; çakışma yok)

-- Ankara Central: özellik yok — filtre “Wi‑Fi” seçilince listelenmemeli (veri yoksa)
-- Antalya Beach: pet_friendly.sql ile evcil dostu olabilir; Wi‑Fi+Priz more_cities’te
