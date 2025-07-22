# Panduan Deployment Aplikasi Hotspot (Laravel + React)

Dokumen ini berisi panduan langkah demi langkah untuk melakukan deployment aplikasi ini ke berbagai jenis server, termasuk server dengan aapanel (VPS/Offline) dan shared hosting seperti Hostinger.

---

## Konsep Dasar Deployment

Aplikasi ini memiliki dua bagian utama:
1.  **Backend (Laravel):** Berada di dalam folder `backend/`. Ini adalah otak aplikasi yang menangani semua logika, API, dan interaksi dengan database serta MikroTik.
2.  **Frontend (React):** Berada di folder `src/` dan file-file root lainnya (`package.json`, `vite.config.ts`, dll). Ini adalah antarmuka untuk Panel Admin.

Tujuan kita adalah:
- Menjalankan backend Laravel di server.
- "Membangun" (build) frontend React menjadi file statis (HTML, CSS, JS).
- Mengonfigurasi server agar bisa menyajikan kedua bagian ini dengan benar.

---

## Topologi Folder untuk Deployment

Untuk mempermudah, berikut adalah visualisasi struktur file dan folder yang harus ada di server Anda untuk setiap metode deployment.

### Metode 1: aapanel / VPS (Direkomendasikan)

Pada metode ini, Anda meng-upload seluruh proyek ke satu direktori, dan *document root* server diarahkan ke sub-folder `backend/public`.

```
/www/wwwroot/hotspot.domainanda.com/  <- Root Proyek di Server
├── .env                              <- Kredensial Frontend (DIBUAT MANUAL DI SERVER)
├── backend/                          <- Folder Backend Laravel
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/                       <- ⭐️ DOCUMENT ROOT SERVER DIARAHKAN KE SINI
│   │   ├── admin/                    <- ✅ Hasil 'npm run build' dipindah ke sini
│   │   │   ├── index.html
│   │   │   └── ... aset statis lainnya
│   │   ├── index.php
│   │   └── storage -> ../storage/app/public (Symbolic Link)
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   │   └── app/
│   │       └── public/
│   │           └── settings/         <- Gambar logo & background akan tersimpan di sini
│   ├── tests/
│   ├── .env                          <- Kredensial Backend (DIBUAT MANUAL DI SERVER)
│   ├── artisan
│   └── composer.json
├── dist/                             <- Boleh dihapus dari server setelah isinya dipindah
├── src/                              <- Folder source code React (di-upload tapi tidak diakses langsung)
├── node_modules/                     <- ❌ JANGAN DI-UPLOAD
├── vendor/                           <- ❌ JANGAN DI-UPLOAD (jalankan 'composer install' di server)
└── ... file-file konfigurasi frontend lainnya (package.json, vite.config.ts, dll)
```

### Metode 2: Hostinger / Shared Hosting

Pada metode ini, Anda hanya meng-upload isi dari folder `backend/` ke `public_html` dan meletakkan hasil build React di dalamnya.

```
/public_html/                         <- ⭐️ DOCUMENT ROOT di Hostinger
├── app/
├── bootstrap/
├── config/
├── database/
├── public/                           <- Folder publik utama
│   ├── admin/                        <- ✅ Hasil 'npm run build' ditaruh di sini
│   │   ├── index.html
│   │   └── ... aset statis lainnya
│   ├── index.php
│   └── storage -> ../storage/app/public (Symbolic Link)
├── resources/
├── routes/
├── storage/
│   └── app/
│       └── public/
│           └── settings/             <- Gambar logo & background akan tersimpan di sini
├── tests/
├── .env                              <- Kredensial (DIBUAT MANUAL DI SERVER)
├── artisan
└── composer.json

// Catatan: Pada metode ini, Anda hanya meng-upload isi dari folder `backend`
// dan hasil build React (`dist/admin/`) ke dalam `public_html`.
// File-file seperti `package.json`, `vite.config.ts`, `src/` dari root proyek lokal Anda tidak perlu di-upload.
```

---

## Langkah 1: Persiapan Lokal (WAJIB DILAKUKAN SEBELUM UPLOAD)

Sebelum meng-upload file ke server, Anda harus "membangun" (build) aplikasi React Anda.

1.  **Buka terminal** di direktori utama proyek Anda (`nuaing/`).
2.  Jalankan perintah berikut:
    ```bash
    npm install
    npm run build
    ```
3.  Perintah ini akan membuat folder baru bernama `dist/`. Di dalamnya akan ada folder `admin/` yang berisi semua file HTML, CSS, dan JavaScript yang dibutuhkan oleh panel admin Anda.

---

## Langkah 2: Deployment ke Server dengan aapanel (VPS/Offline)

Metode ini adalah yang **paling direkomendasikan** karena memberikan Anda kontrol penuh.

### A. Konfigurasi di aapanel
1.  **Buat Website Baru:**
    -   Masuk ke aapanel, klik "Website" -> "Add Site".
    -   Masukkan nama domain Anda (misal: `hotspot.domainanda.com`).
    -   Pilih versi PHP yang sesuai (misal: PHP 8.1 atau lebih tinggi).
    -   Pilih database: "Create a database" -> MySQL. Simpan baik-baik nama database, username, dan password yang dibuat.
2.  **Atur Document Root:**
    -   Setelah situs dibuat, buka pengaturannya ("Settings").
    -   Pergi ke tab "Site Directory".
    -   Ubah "Document Root" dari `/www/wwwroot/hotspot.domainanda.com` menjadi `/www/wwwroot/hotspot.domainanda.com/backend/public`. **Ini sangat penting!**
3.  **Unggah File Proyek:**
    -   Buka "Files" di aapanel dan navigasi ke direktori root situs Anda (`/www/wwwroot/hotspot.domainanda.com`).
    -   Unggah **seluruh folder proyek Anda** (kecuali folder `node_modules` dan `vendor` jika ada) ke direktori ini. Anda bisa meng-uploadnya sebagai file ZIP lalu mengekstraknya di server.
    -   Setelah diunggah, pastikan folder `dist/admin/` yang kita buat di "Langkah 1" ada di dalam direktori root proyek.

### B. Konfigurasi Backend di Server via Terminal
1.  **Akses Terminal:** Gunakan fitur "Terminal" di aapanel atau hubungkan via SSH.
2.  **Navigasi ke Direktori Backend:**
    ```bash
    cd /www/wwwroot/hotspot.domainanda.com/backend
    ```
3.  **Install Dependensi PHP:**
    ```bash
    composer install --no-dev --optimize-autoloader
    ```
4.  **Konfigurasi File `.env`:**
    -   Salin file `.env.example` menjadi `.env`.
        ```bash
        cp .env.example .env
        ```
    -   Buka file `.env` tersebut (`nano .env` atau gunakan editor aapanel).
    -   Isi semua konfigurasi yang diperlukan:
        -   `APP_NAME`, `APP_URL` (sesuai domain Anda).
        -   `APP_ENV=production`, `APP_DEBUG=false`.
        -   `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (sesuai yang Anda dapat dari aapanel).
        -   Semua kunci API (Pusher, Google, Fonte, MikroTik).
        -   **PENTING**: Hasilkan kunci aplikasi baru: `php artisan key:generate`
5.  **Jalankan Migrasi Database:**
    ```bash
    php artisan migrate --force
    ```
6.  **Buat Storage Link:**
    ```bash
    php artisan storage:link
    ```
7.  **Optimasi Konfigurasi:**
    ```bash
    php artisan config:cache
    php artisan route:cache
    ```
8.  **Atur Kepemilikan & Izin File:**
    -   Kembali ke aapanel -> "Files".
    -   Navigasi ke `/www/wwwroot/hotspot.domainanda.com`.
    -   Klik tombol "Fix permission and ownership".

### C. Pindahkan Hasil Build React
Langkah terakhir adalah memindahkan hasil build React kita ke tempat yang bisa diakses oleh Laravel.
1.  **Gunakan terminal atau "Files" di aapanel.**
2.  Pindahkan folder `admin` dari dalam `dist` ke dalam `backend/public`.
    ```bash
    # Dari direktori root proyek (/www/wwwroot/hotspot.domainanda.com)
    mv dist/admin backend/public/
    ```

Sekarang, aplikasi Anda seharusnya sudah berjalan. Halaman login hotspot bisa diakses di `http://hotspot.domainanda.com/hotspot/login` dan panel admin di `http://hotspot.domainanda.com/admin`.

---

## Langkah 3: Deployment ke Hostinger Shared Hosting

Shared hosting lebih terbatas, tetapi masih memungkinkan. Caranya sedikit berbeda.

1.  **Persiapan Folder:**
    -   Di komputer lokal Anda, buat sebuah folder baru, misal `deploy_hostinger`.
    -   Salin **semua isi dari folder `backend/`** ke dalam `deploy_hostinger/`.
    -   Salin folder **`dist/admin/`** ke dalam `deploy_hostinger/public/`. Jadi, path-nya akan menjadi `deploy_hostinger/public/admin`.
2.  **Upload ke Hostinger:**
    -   Buka File Manager di Hostinger.
    -   Navigasi ke direktori `public_html`.
    -   **Hapus semua isi `public_html`** (jika ada file default).
    -   Upload **semua isi dari folder `deploy_hostinger/`** ke dalam `public_html`.
3.  **Struktur Direktori:**
    -   Sekarang, struktur di `public_html` Anda akan terlihat seperti ini: `app/`, `bootstrap/`, `config/`, `database/`, `public/` (dengan folder `admin` di dalamnya), `routes/`, `storage/`, `artisan`, dll.
4.  **Konfigurasi Database:**
    -   Buat database baru di Hostinger melalui menu "Manajemen" -> "Database MySQL". Simpan detailnya.
5.  **Konfigurasi `.env`:**
    -   Di File Manager, cari file `.env` yang sudah Anda upload.
    -   Edit file tersebut dan masukkan semua kredensial yang sesuai untuk Hostinger (URL, Database, API Keys). Pastikan `APP_ENV=production` dan `APP_DEBUG=false`.
6.  **Jalankan Perintah Artisan (jika memungkinkan):**
    -   Beberapa shared hosting (termasuk Hostinger pada beberapa paket) menyediakan akses SSH. Jika ada, hubungkan dan jalankan:
        ```bash
        # Di dalam direktori public_html
        php artisan migrate --force
        php artisan storage:link
        php artisan config:cache
        php artisan route:cache
        ```
    -   **Jika tidak ada akses SSH:** Anda harus meng-import database secara manual melalui phpMyAdmin dan mungkin akan menghadapi masalah dengan `storage:link`. Untuk `storage:link`, Anda mungkin bisa mencoba membuat rute sementara di `web.php` untuk menjalankannya.

Aplikasi Anda sekarang seharusnya sudah bisa diakses. Metode shared hosting ini lebih rumit karena keterbatasan kontrol. Metode aapanel jauh lebih disarankan untuk aplikasi semacam ini.