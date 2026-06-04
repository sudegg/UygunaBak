import fs from 'fs';
import path from 'path';
import { Pool, Client } from 'pg';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Admin bağlantısı için (veritabanı oluşturmak)
const adminClient = new Client({
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
});

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'uygunabak_db'
});

async function ensureCampaignsTable(poolInstance) {
    try {
        await poolInstance.query(`
            CREATE TABLE IF NOT EXISTS cafe_campaigns (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                discount_percent NUMERIC(5,2) DEFAULT NULL,
                starts_at DATE NOT NULL,
                ends_at DATE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT cafe_campaigns_dates_chk CHECK (ends_at >= starts_at)
            );
            CREATE INDEX IF NOT EXISTS idx_cafe_campaigns_cafe ON cafe_campaigns(cafe_id);
        `);
        console.log('✅ Kampanya tablosu hazır.');
    } catch (e) {
        console.warn('⚠️  Kampanya tablosu oluşturulamadı (cafes tablosu yok olabilir):', e.message);
    }
}

async function ensureReportsTable(poolInstance) {
    try {
        await poolInstance.query(`
            CREATE TABLE IF NOT EXISTS cafe_reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
                reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                report_type VARCHAR(80) NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                created_at TIMESTAMP DEFAULT NOW(),
                resolved_at TIMESTAMP DEFAULT NULL,
                resolved_by UUID DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
                CONSTRAINT cafe_reports_status_chk CHECK (status IN ('open', 'in_review', 'resolved'))
            );
            CREATE INDEX IF NOT EXISTS idx_cafe_reports_cafe ON cafe_reports(cafe_id);
            CREATE INDEX IF NOT EXISTS idx_cafe_reports_status ON cafe_reports(status);
        `);
        console.log('✅ Rapor tablosu hazır.');
    } catch (e) {
        console.warn('⚠️  Rapor tablosu oluşturulamadı (temel tablolar eksik olabilir):', e.message);
    }
}

export const initializeDatabase = async () => {
    try {
        console.log('Veritabanı bağlantısı deneniyor...');
        const res = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);
        
        if (res.rows[0].exists) {
            console.log('✅ Veritabanı zaten kurulu.');
            await ensureCampaignsTable(pool);
            await ensureReportsTable(pool);
        } else {
            console.log('⚠️  Veritabanı tabloları bulunamadı.');
        }
    } catch (err) {
        console.error('⚠️  Veritabanı bağlantı hatası:', err.message);
        console.log('💡 Devam etmeye çalışılıyor...');
    }
};