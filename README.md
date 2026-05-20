# 💊 ZynHealth — Manajemen Obat Anak
> Aplikasi PWA (Progressive Web App) untuk memantau, mencatat, dan mengelola obat-obatan anak dengan aman dan mudah.

![ZynHealth Banner](icons/icon-512.png)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|------------|
| 📋 **Daftar Obat** | Catat semua obat anak lengkap dengan foto, dosis, expired, lokasi |
| 🧮 **Kalkulator Dosis** | Hitung dosis Paracetamol, Ibuprofen, Amoxicillin, dll berdasarkan BB |
| 🤖 **ZynBot AI** | Asisten AI (Gemini/GPT/Claude) untuk tanya jawab seputar obat anak |
| 📝 **Catatan Keluarga** | Catat alergi, jadwal kontrol, pengingat penting |
| 🔐 **PIN Ganda** | PIN terpisah untuk Ayah (1111) & Bunda (2222) |
| ⚠️ **Alert Kadaluarsa** | Notifikasi otomatis obat yang akan habis masa berlakunya |
| 🌙 **Dark Mode** | Tema gelap/terang otomatis |
| 📱 **PWA** | Bisa diinstall di HP seperti aplikasi native |
| 🖨️ **Cetak Laporan** | Export laporan A4 langsung dari browser |

---

## 🚀 Deploy ke GitHub Pages (Gratis)

### Langkah 1 — Buat Repository GitHub

1. Buka [github.com](https://github.com) → Login
2. Klik tombol **"New"** (pojok kiri atas)
3. Isi nama repository: `zynhealth` (atau nama lain)
4. Pilih **Public**
5. Klik **"Create repository"**

### Langkah 2 — Upload File

**Cara A — Via GitHub Web (Paling mudah):**
1. Di halaman repository baru, klik **"uploading an existing file"**
2. Drag & drop SEMUA file dari folder `zynhealth-pwa/` ini:
   ```
   📁 zynhealth-pwa/
   ├── index.html        ← Wajib
   ├── manifest.json     ← Wajib (untuk PWA)
   ├── sw.js             ← Wajib (service worker)
   └── icons/            ← Wajib (semua file icon)
       ├── icon.svg
       ├── icon-72.png
       ├── icon-96.png
       ├── icon-128.png
       ├── icon-144.png
       ├── icon-152.png
       ├── icon-192.png
       ├── icon-384.png
       ├── icon-512.png
       ├── apple-touch-icon.png
       ├── favicon-32.png
       └── favicon.ico
   ```
3. Klik **"Commit changes"**

**Cara B — Via Git CLI:**
```bash
git clone https://github.com/USERNAME/zynhealth.git
# Copy semua file zynhealth-pwa/ ke folder zynhealth/
cp -r zynhealth-pwa/* zynhealth/
cd zynhealth
git add .
git commit -m "🚀 Deploy ZynHealth PWA v2.0"
git push origin main
```

### Langkah 3 — Aktifkan GitHub Pages

1. Di repository GitHub → klik **"Settings"** (tab atas)
2. Scroll ke bawah → cari **"Pages"** di sidebar kiri
3. Di bagian **"Source"**, pilih:
   - Branch: **`main`**
   - Folder: **`/ (root)`**
4. Klik **"Save"**
5. Tunggu 1-2 menit → URL akan muncul:
   ```
   https://USERNAME.github.io/zynhealth/
   ```

---

## 📲 Cara Install di HP

### Android (Chrome)
1. Buka URL GitHub Pages di Chrome
2. Tunggu banner **"Pasang ZynHealth"** muncul di bawah → Tap **Install**
3. **ATAU**: Tap menu ⋮ → **"Add to Home screen"**
4. Tap **Install** → Selesai! Ikon ZynHealth muncul di layar HP

### iPhone / iPad (Safari)
1. Buka URL GitHub Pages di **Safari** (wajib Safari, bukan Chrome)
2. Tap tombol **Share** (kotak dengan panah ke atas) ↑
3. Scroll → Tap **"Add to Home Screen"**
4. Ketik nama (biarkan "ZynHealth") → Tap **Add**
5. Selesai! Ikon ZynHealth muncul di Home Screen

### Ciri Aplikasi Sudah Terinstall ✅
- Ikon ZynHealth (hijau dengan perisai) muncul di layar beranda
- Saat dibuka: tampil **full screen** tanpa address bar browser
- Bisa dipakai **offline** (data tersimpan di perangkat)

---

## 🔧 Konfigurasi AI (Opsional)

ZynBot memerlukan API Key untuk menjawab pertanyaan:

| Provider | Cara Dapat API Key | URL |
|----------|-------------------|-----|
| Google Gemini | Google AI Studio | [aistudio.google.com](https://aistudio.google.com) |
| OpenAI (GPT) | OpenAI Platform | [platform.openai.com](https://platform.openai.com) |
| Claude (Anthropic) | Anthropic Console | [console.anthropic.com](https://console.anthropic.com) |
| DeepSeek | DeepSeek Platform | [platform.deepseek.com](https://platform.deepseek.com) |

**Cara memasukkan API Key:**
1. Buka ZynHealth → Menu **"Pengaturan"**
2. Pilih **Penyedia AI** yang Anda gunakan
3. Tempel API Key di kolom yang tersedia
4. Klik **"Simpan Pengaturan"**

---

## 💾 Penyimpanan Data

Versi GitHub Pages menyimpan semua data di **localStorage browser** (offline-first):
- Data obat, catatan, dan pengaturan tersimpan di perangkat
- Tidak ada server/cloud (privasi terjaga)
- **PENTING:** Hapus cache browser = data hilang → selalu backup via Cetak Laporan

---

## 🔗 Integrasi Google Sheets (Opsional)

Untuk sinkronisasi data ke cloud via Google Sheets, gunakan versi **Google Apps Script**:
1. Buka [script.google.com](https://script.google.com)
2. Buat project baru → paste `Code.gs` dan `Index.html` (versi GAS)
3. Deploy sebagai Web App
4. Lebih detail di [dokumentasi GAS](https://developers.google.com/apps-script)

---

## 🛡️ Keamanan & Privasi

- **PIN Ayah:** `1111` (default) — ubah di Pengaturan
- **PIN Bunda:** `2222` (default) — ubah di Pengaturan
- Semua data tersimpan **lokal** di perangkat Anda
- Tidak ada tracking, analytics, atau iklan
- API Key hanya digunakan untuk request AI, tidak disimpan di server manapun

---

## 📁 Struktur File

```
zynhealth/
├── index.html          # Aplikasi utama (PWA)
├── manifest.json       # Konfigurasi PWA (nama, icon, warna)
├── sw.js               # Service Worker (offline support)
├── README.md           # Panduan ini
└── icons/
    ├── icon.svg        # Icon vektor (semua ukuran)
    ├── icon-72.png     # Android small
    ├── icon-96.png     # Android medium
    ├── icon-128.png    # Chrome Web Store
    ├── icon-144.png    # Windows tile
    ├── icon-152.png    # iPad
    ├── icon-192.png    # Android / PWA standard
    ├── icon-384.png    # Android large
    ├── icon-512.png    # PWA splash / store
    ├── apple-touch-icon.png  # iPhone home screen
    ├── favicon-32.png  # Browser tab (small)
    └── favicon.ico     # Browser tab (legacy)
```

---

## 🆘 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Ikon tidak muncul di HP | Pastikan upload folder `icons/` ke GitHub |
| Tidak bisa install (Android) | Buka di Chrome, tunggu 30 detik, refresh |
| Tidak bisa install (iPhone) | Wajib pakai Safari, bukan Chrome/Firefox |
| Data hilang | Data di localStorage. Jangan hapus cache browser |
| ZynBot tidak merespons | Periksa API Key di menu Pengaturan |
| Halaman 404 di GitHub Pages | Tunggu 5 menit setelah aktifkan Pages |

---

## 📞 Kredit & Lisensi

- **Dibuat oleh:** Arazmi (GAS Premium)
- **Framework:** TailwindCSS, Chart.js, SweetAlert2, Lucide Icons
- **AI Engine:** Google Gemini / OpenAI / Anthropic Claude
- **Versi:** 2.0 · 2026
- **Lisensi:** Bebas digunakan untuk keperluan pribadi & keluarga

---

> 💚 *Semoga ZynHealth membantu Ayah & Bunda merawat si kecil dengan lebih mudah dan terorganisir!*
