# 🔒 Güvenlik Rehberi (Security Guide)

## ⚠️ Hassas Bilgileri Asla GitHub'a Yüklemeyin!

Bu proje hassas bilgileri `.gitignore` dosyası ile korur. Lütfen aşağıdaki dosyaları **ASLA** commitlemyin:

### Gizlenmesi Gereken Dosyalar

- `.env` - Veritabanı şifresi, API anahtarları, JWT token şifresi
- `.env.local` - Yerel ortam değişkenleri
- `.env.production.local` - Production ortam değişkenleri
- `node_modules/` - Proje bağımlılıkları
- `*.log` - Log dosyaları

### `.env` Dosyası Ayarlamak

1. **Backend klasöründe `.env` dosyası oluşturun:**
   ```bash
   cp .env.example .env
   ```

2. **`.env` dosyasını düzenleyin ve gerçek değerleri girin:**
   ```
   PORT=5050
   PGUSER=postgres
   PGHOST=localhost
   PGPASSWORD=your_actual_password
   PGDATABASE=uygunabak_db
   PGPORT=5432
   JWT_SECRET=your_secure_random_key_here
   NODE_ENV=development
   ```

3. **.gitignore'da `.env` tanımlı olduğunu doğrulayın:**
   ```
   .env
   .env.local
   .env.*.local
   ```

## 🔐 Secure JWT Secret Oluşturmak

Terminal'de aşağıdaki komutu çalıştırın ve çıktıyı `.env` dosyasına yapıştırın:

```bash
# Node.js ile güvenli random string oluştur
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Örnek çıktı:
```
a7f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9
```

## 🚨 Eğer Yanlışlıkla Şifre Commitlediyseniz

GitHub'a yüklendikten sonra şifre değiştirin:

1. **Hemen veritabanı şifresini değiştirin:**
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_secure_password';
   ```

2. **JWT_SECRET'i değiştirin** (`.env` dosyasında)

3. **İlk commit'i sil** (eğer hala ilk commit ise):
   ```bash
   # ⚠️ Sadece ilk commit ise ve kimse pull etmediyse
   git reset --soft HEAD~1
   git reset HEAD
   # Hassas bilgileri sil
   git add .env
   git commit --amend -m "Initial commit: remove sensitive data"
   git push --force-with-lease
   ```

4. **Git history'den tamamen kaldırmak** (advanced):
   ```bash
   # BFG Repo-Cleaner kullanarak
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

## ✅ Production İçin Öneriler

1. **Ortam değişkenlerini serverde ayarlayın:**
   - Heroku, AWS, Azure, Google Cloud'da native environment variable desteği var
   - `.env` dosyası üretim ortamında kullanılmamalı

2. **API Anahtarlarını döndürün:**
   ```bash
   # JWT_SECRET'i periyodik olarak değiştirin
   # Özellikle çalışan ayrıldığında
   ```

3. **Veritabanı Güvenliği:**
   - Güçlü şifreler kullanın (minimum 12 karakter, karışık)
   - SSL/TLS bağlantısı zorunlu kılın
   - Firewall ile erişimi sınırlandırın

4. **Logging:**
   - Şifreleri loglamayın
   - Sensitif verileri redact edin:
   ```javascript
   // ❌ Yanlış:
   console.log('DB Password:', process.env.PGPASSWORD);
   
   // ✅ Doğru:
   console.log('Database connected to:', process.env.PGHOST);
   ```

## 🔍 Git Commit Öncesi Kontrol Listesi

Commit yapmadan önce:

```bash
# Commit'te neler var?
git status

# Hassas dosya ekleyecek miyim?
git diff

# .env ve diğer hassas dosyalar yok mu?
git check-ignore .env
git check-ignore YL2_Project2/backend/.env
```

## 📚 Kaynaklar

- [GitHub - Secure Coding](https://github.com/about/security)
- [OWASP - Secrets Management](https://owasp.org/www-project-top-10/)
- [dotenv npm paketi](https://www.npmjs.com/package/dotenv)

---

**Güvenlik her zaman göz önünde bulundurun! 🛡️**
