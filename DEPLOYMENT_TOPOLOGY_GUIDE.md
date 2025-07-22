# 0. Topologi Hybrid Hostinger (SPA di Root & Admin di Subfolder)

```
/public_html/                         <- DOCUMENT ROOT di Hostinger
├── index.html                        <- Hasil build React (login hotspot, SPA utama)
├── admin/                            <- Hasil build React untuk panel admin
│   ├── index.html
│   └── ... aset statis lainnya
├── app/
├── bootstrap/
├── config/
├── database/
├── public/                           <- Folder publik utama Laravel (bisa kosong atau hanya asset)
├── resources/
├── routes/
├── storage/
├── .env                              <- Konfigurasi environment
├── index.php                         <- Entry point Laravel (API/backend)
├── .htaccess                         <- File routing Laravel
└── ... file Laravel lainnya
```

- Semua request ke `/admin/*` diarahkan ke `admin/index.html` (route catch-all di Laravel).
- Semua request ke `/api/*` atau endpoint backend tetap ditangani oleh Laravel (`index.php`).
- Untuk login hotspot, user langsung akses `index.html` di root.
- Untuk panel admin, user akses `/admin/` (SPA React admin).

**Catatan:**
- Tidak bisa mengatur document root ke subfolder di shared hosting, jadi semua file publik harus di root atau subfolder langsung di root.
- File sensitif seperti `.env` harus dijaga permission-nya.
- Jangan upload source code React (`src/`, `node_modules/`) ke server, hanya hasil build saja.

# Panduan Deployment Hotspot (Laravel + React) — Topologi Lengkap

## 1. Topologi Folder — Hostinger (Shared Hosting)

```
/public_html/                         <- DOCUMENT ROOT di Hostinger
├── app/
├── bootstrap/
├── config/
├── database/
├── public/                           <- Folder publik utama Laravel
│   ├── admin/                        <- Hasil build React (panel admin)
│   │   ├── index.html
│   │   └── ... aset statis lainnya
│   ├── index.php                     <- Entry point Laravel
│   └── storage -> ../storage/app/public (Symbolic Link)
├── resources/
├── routes/
├── storage/
│   └── app/
│       └── public/
│           └── settings/             <- Gambar/logo/background
├── tests/
├── .env                              <- Konfigurasi environment
├── artisan
└── composer.json
```

- Upload isi folder `backend/` ke `public_html/`.
- Upload hasil build React (`dist/admin/`) ke `public_html/public/admin/`.
- Jangan upload `node_modules` dan `vendor` (jalankan `composer install` di server jika ada SSH).

## 2. Topologi Folder — aapanel (VPS/Offline)

```
/www/wwwroot/hotspot.domainanda.com/  <- Root Proyek di Server
├── .env                              <- Konfigurasi environment
├── backend/                          <- Folder Backend Laravel
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/                       <- DOCUMENT ROOT SERVER DIARAHKAN KE SINI
│   │   ├── admin/                    <- Hasil build React (panel admin)
│   │   │   ├── index.html
│   │   │   └── ... aset statis lainnya
│   │   ├── index.php
│   │   └── storage -> ../storage/app/public (Symbolic Link)
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   │   └── app/
│   │       └── public/
│   │           └── settings/
│   ├── tests/
│   ├── .env
│   ├── artisan
│   └── composer.json
├── dist/                             <- Boleh dihapus setelah build dipindah
└── ... file-file frontend (src/, package.json, dll)
```

- Upload seluruh folder proyek ke `/www/wwwroot/hotspot.domainanda.com/`.
- Set document root ke `backend/public`.
- Pindahkan hasil build React (`dist/admin/`) ke `backend/public/admin/`.

## 3. Langkah Umum Deployment

1. **Build React:**
   ```bash
   npm install
   npm run build
   # Hasil build ada di dist/admin/
   ```
2. **Upload Backend & Build React ke Server**
3. **Konfigurasi .env** (database, API key, dsb)
4. **Jalankan Composer** (jika ada SSH):
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan migrate --force
   php artisan storage:link
   php artisan config:cache
   php artisan route:cache
   ```
5. **Cek permission file/folder** (755 untuk folder, 644 untuk file)
6. **Pastikan route catch-all Laravel untuk /admin/{any} diarahkan ke admin/index.html**

## 4. Catatan Penting
- Jangan upload folder `node_modules` dan `vendor`.
- Untuk Hostinger, jika tidak ada SSH, upload vendor dari lokal.
- Untuk aapanel, gunakan fitur Fix Permission jika ada error permission.
- Pastikan semua file hasil build React sudah lengkap di-upload.

---

> Untuk detail konfigurasi API (MikroTik, WhatsApp, Google), lihat file `API_CONFIGURATION_GUIDE.md`.
> Untuk troubleshooting error deployment, lihat `ERROR_SUMMARY_DEPLOYMENT.md`.
