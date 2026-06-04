-- Postgres için gerekli uuid eklentisini ekliyoruz (gen_random_uuid kullanmak için)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role için ENUM tipi oluşturuluyor
CREATE TYPE user_role AS ENUM ('customer', 'owner', 'admin');

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. LOCATIONS
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    city VARCHAR(80) NOT NULL,
    district VARCHAR(80) NOT NULL,
    latitude DECIMAL(9,6) DEFAULT NULL,
    longitude DECIMAL(9,6) DEFAULT NULL
);

-- 3. CAFES
CREATE TABLE cafes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    location_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    avg_rating DECIMAL(2,1) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT
);

ALTER TABLE cafes
    DROP CONSTRAINT IF EXISTS unique_cafe_owner;

-- 4. CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    parent_id INT DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(8,2) NOT NULL,
    currency CHAR(3) DEFAULT 'TRY',
    is_available BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 6. REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cafe_id UUID NOT NULL,
    overall_rating SMALLINT CHECK (overall_rating >= 1 AND overall_rating <= 5),
    product_rating SMALLINT CHECK (product_rating >= 1 AND product_rating <= 5),
    price_rating SMALLINT CHECK (price_rating >= 1 AND price_rating <= 5),
    ambiance_rating SMALLINT CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
    service_rating SMALLINT CHECK (service_rating >= 1 AND service_rating <= 5),
    calculated_rating DECIMAL(3,2),
    comment TEXT CHECK (char_length(comment) >= 10 AND char_length(comment) <= 1000),
    is_reported BOOLEAN DEFAULT FALSE,
    report_count INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    owner_reply TEXT,
    reply_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    CONSTRAINT unique_active_user_review UNIQUE (user_id, cafe_id) -- Bir kullanıcı bir kafeye max 1 yorum
);

-- 7. CAFE_REPORTS
CREATE TABLE cafe_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID NOT NULL,
    reporter_id UUID NOT NULL,
    report_type VARCHAR(80) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP DEFAULT NULL,
    resolved_by UUID DEFAULT NULL,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT cafe_reports_status_chk CHECK (status IN ('open', 'in_review', 'resolved'))
);

-- 8. CAFE_FEATURES
CREATE TABLE cafe_features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    icon VARCHAR(50) DEFAULT NULL
);

-- 9. CAFE_FEATURE_MAP
CREATE TABLE cafe_feature_map (
    cafe_id UUID NOT NULL,
    feature_id INT NOT NULL,
    PRIMARY KEY (cafe_id, feature_id),
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    FOREIGN KEY (feature_id) REFERENCES cafe_features(id) ON DELETE CASCADE
);

-- 10. FAVORITES
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cafe_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_favorite UNIQUE (user_id, cafe_id)
);

-- 11. AI_SEARCH_HISTORY
CREATE TABLE ai_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    query_text TEXT NOT NULL,
    filters_applied JSON,
    result_snapshot JSON,
    created_at TIMESTAMP DEFAULT NOW(), 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
