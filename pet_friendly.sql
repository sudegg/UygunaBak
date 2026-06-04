-- Evcil hayvan dostu özelliği ekleme
INSERT INTO cafe_features (name, icon) VALUES ('Evcil Hayvan Dostu', 'heart');

-- Bazı kafelere evcil hayvan dostu özelliği ekleme
INSERT INTO cafe_feature_map (cafe_id, feature_id)
SELECT c.id, cf.id
FROM cafes c, cafe_features cf
WHERE c.name IN ('Kadıköy Kahve', 'Şişli Coffee', 'Antalya Beach')
AND cf.name = 'Evcil Hayvan Dostu';