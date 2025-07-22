# Panduan Konfigurasi API

Dokumen ini merinci langkah-langkah yang diperlukan untuk mengkonfigurasi koneksi API ke MikroTik, Fonte WhatsApp, dan Integrasi Google untuk aplikasi Hotspot Management System Anda.

## 1. Konfigurasi Koneksi API MikroTik

Koneksi ke MikroTik Router dilakukan melalui API-nya. Pastikan router Anda dapat diakses dari server tempat aplikasi ini di-deploy.

### Langkah 1: Aktifkan Layanan API di MikroTik

1.  **Akses MikroTik Anda:** Gunakan Winbox atau SSH untuk terhubung ke router MikroTik Anda.
2.  **Buka IP Services:** Navigasi ke `IP` -> `Services`.
3.  **Aktifkan API:** Cari layanan `api` (biasanya di port `8728`) dan pastikan statusnya `enabled`. Jika tidak, klik dua kali dan centang `Enabled`.
4.  **Atur Allowed Addresses (Opsional tapi Direkomendasikan):** Untuk keamanan, Anda bisa membatasi IP mana saja yang boleh mengakses API. Tambahkan IP server Anda ke daftar `Allowed From`.

### Langkah 2: Buat Pengguna API Khusus di MikroTik

Sangat disarankan untuk membuat pengguna terpisah dengan hak akses yang diperlukan untuk API, daripada menggunakan akun admin utama.

1.  **Akses MikroTik Anda:** Gunakan Winbox atau SSH.
2.  **Buka Users:** Navigasi ke `System` -> `Users`.
3.  **Tambahkan Pengguna Baru:** Klik tombol `+` untuk menambahkan pengguna baru.
    *   **Name:** `hotspot-api` (atau nama lain yang Anda inginkan)
    *   **Password:** Masukkan kata sandi yang kuat dan unik.
    *   **Group:** Pilih `full` (untuk memastikan semua perintah API dapat dijalankan).
4.  **Terapkan Perubahan:** Klik `Apply` atau `OK`.

### Langkah 3: Konfigurasi Variabel Lingkungan di Aplikasi Laravel

Di file `.env` proyek Laravel Anda, tambahkan atau perbarui detail koneksi MikroTik:

```env
MIKROTIK_HOST=your_mikrotik_ip_address_or_ddns # Contoh: 192.168.1.1 atau your.ddns.net
MIKROTIK_PORT=8728
MIKROTIK_USERNAME=hotspot-api # Username yang Anda buat di Langkah 2
MIKROTIK_PASSWORD=your_secure_password # Password yang Anda buat di Langkah 2
```

*   **`MIKROTIK_HOST`**: Ini adalah alamat IP publik router MikroTik Anda atau nama domain DDNS jika Anda menggunakannya. Jika aplikasi di-deploy di jaringan lokal yang sama dengan MikroTik, bisa juga IP lokal MikroTik.
*   **`MIKROTIK_PORT`**: Port API MikroTik, defaultnya 8728.
*   **`MIKROTIK_USERNAME`**: Username API yang Anda buat di MikroTik.
*   **`MIKROTIK_PASSWORD`**: Password untuk username API tersebut.

## 2. Konfigurasi Fonte WhatsApp API

Aplikasi ini menggunakan Fonte API untuk mengirim OTP via WhatsApp.

### Langkah 1: Dapatkan Kredensial Fonte API Anda

1.  **Kunjungi Fonte.id:** Buka situs web [https://fonte.id](https://fonte.id).
2.  **Daftar/Login:** Buat akun atau masuk ke akun Anda.
3.  **Dapatkan API Key dan Device ID:** Di dashboard Fonte.id, Anda akan menemukan `API Key` dan `Device ID` Anda. Pastikan perangkat WhatsApp Anda sudah terhubung dan aktif di Fonte.id.

### Langkah 2: Konfigurasi Variabel Lingkungan di Aplikasi Laravel

Di file `.env` proyek Laravel Anda, tambahkan atau perbarui kredensial Fonte API Anda:

```env
FONTE_API_KEY=your_fonte_api_key_here
FONTE_DEVICE_ID=your_fonte_device_id_here
```

*   **`FONTE_API_KEY`**: Kunci API yang Anda dapatkan dari Fonte.id.
*   **`FONTE_DEVICE_ID`**: ID perangkat WhatsApp Anda yang terdaftar di Fonte.id.

## 3. Konfigurasi Integrasi Google (OAuth)

Integrasi Google memungkinkan pengguna login ke hotspot menggunakan akun Google mereka.

### Langkah 1: Buat Proyek dan Kredensial OAuth di Google Cloud Console

1.  **Kunjungi Google Cloud Console:** Buka [https://console.developers.google.com](https://console.developers.google.com).
2.  **Buat Proyek Baru:** Jika Anda belum memiliki proyek, buat proyek baru.
3.  **Aktifkan Google People API:**
    *   Di menu navigasi, pilih `APIs & Services` -> `Library`.
    *   Cari `Google People API` dan aktifkan.
4.  **Buat Layar Persetujuan OAuth (OAuth Consent Screen):**
    *   Di menu navigasi, pilih `APIs & Services` -> `OAuth consent screen`.
    *   Pilih `External` dan klik `CREATE`.
    *   Isi informasi yang diperlukan (Nama Aplikasi, Email Dukungan Pengguna, dll.).
    *   Tambahkan `Scopes` yang diperlukan, minimal `.../auth/userinfo.email` dan `.../auth/userinfo.profile`.
    *   Tambahkan `Test users` jika Anda masih dalam tahap pengembangan.
5.  **Buat Kredensial ID Klien OAuth:**
    *   Di menu navigasi, pilih `APIs & Services` -> `Credentials`.
    *   Klik `CREATE CREDENTIALS` -> `OAuth client ID`.
    *   Pilih `Web application` sebagai Application type.
    *   **Name:** Berikan nama yang deskriptif (misalnya, "Hotspot Google Login").
    *   **Authorized JavaScript origins:** Biarkan kosong atau tambahkan URL frontend Anda jika Anda menggunakan domain yang berbeda untuk frontend (misalnya, `http://localhost:3000` jika Anda menguji frontend secara terpisah).
    *   **Authorized redirect URIs:** **Ini sangat penting!** Tambahkan URL callback yang akan digunakan oleh aplikasi Laravel Anda. Ini harus sesuai dengan `GOOGLE_REDIRECT_URI` di file `.env` Anda.
        *   Contoh: `https://yourdomain.com/auth/google/callback`
        *   Jika Anda menguji secara lokal dengan Laravel, bisa jadi `http://localhost:8000/auth/google/callback`.
    *   Klik `CREATE`.
6.  **Catat Client ID dan Client Secret:** Setelah kredensial dibuat, Anda akan melihat `Client ID` dan `Client Secret` Anda. Catat keduanya.

### Langkah 2: Konfigurasi Variabel Lingkungan di Aplikasi Laravel

Di file `.env` proyek Laravel Anda, tambahkan atau perbarui kredensial Google OAuth Anda:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback # HARUS SAMA DENGAN YANG DI GOOGLE CLOUD CONSOLE
```

*   **`GOOGLE_CLIENT_ID`**: ID Klien yang Anda dapatkan dari Google Cloud Console.
*   **`GOOGLE_CLIENT_SECRET`**: Rahasia Klien yang Anda dapatkan dari Google Cloud Console.
*   **`GOOGLE_REDIRECT_URI`**: URL lengkap ke endpoint callback Google di aplikasi Laravel Anda. **Pastikan ini cocok persis** dengan yang Anda masukkan di Google Cloud Console.

---

Setelah Anda menyelesaikan konfigurasi ini, pastikan untuk menjalankan `php artisan config:clear` dan `php artisan cache:clear` di server Laravel Anda untuk memastikan variabel lingkungan yang baru dimuat.

Jika Anda memiliki pertanyaan lebih lanjut atau mengalami masalah selama proses ini, jangan ragu untuk bertanya!