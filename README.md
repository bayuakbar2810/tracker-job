# JobTrack — Personal Job Application Management System

JobTrack adalah personal web application modern yang dirancang sesuai PRD (`JOB.txt`) untuk membantu mengelola, memantau, dan menganalisis seluruh proses lamaran kerja secara profesional dan terstruktur.

---

## Fitur Utama Berdasarkan PRD

### 1. Dashboard Interaktif (PRD §8 - §11)
- **Salam & Header Personalisasi:** Menyesuaikan waktu (Pagi/Siang/Sore/Malam) dan profil pengguna (**Bayu Akbar**).
- **KPI Cards:** Total Applications, Active Applications, Interviews Scheduled, dan Offers Received.
- **Application Pipeline Visual:** Diagram kemajuan lamaran dari tahap *Applied*, *Screening*, *Interview*, *Test*, hingga *Offer/Hired*.
- **Follow Up Required Card:** Peringatan langsung lamaran yang perlu di-follow up dengan tombol aksi cepat (*View Application* dan *Follow Up*).
- **Recent Applications:** Daftar lamaran terbaru lengkap dengan durasi hari otomatis dan pengubah status 1-klik.

### 2. Applications Management (PRD §29, §41, §44)
- **Tampilan Fleksibel:** Switch antara **Table View** dan **Kanban Pipeline Board**.
- **Filter Tab:** *All*, *Active*, *Interview*, *Follow Up*, *Closed*.
- **Multi-Filter:** Filter berdasarkan Platform, Sistem Kerja (Remote/Hybrid/Onsite), dan Tag kualifikasi.
- **Pencarian Global:** Mencari nama perusahaan, posisi, recruiter, platform, atau catatan.
- **1-Click Status Update:** Mengubah status langsung dari tabel atau board yang secara otomatis mencatat riwayat ke timeline.
- **Export Data:** Download data ke format **CSV Spreadsheet** atau **Full JSON Backup**.

### 3. Multi-Section Form Lamaran Baru (PRD §12 - §16)
- **Section 1 — Perusahaan:** Nama perusahaan, posisi, lokasi, sistem kerja, tipe pekerjaan, dan ekspektasi gaji.
- **Section 2 — Sumber Lowongan:** Kartu platform (LinkedIn, Jobstreet, Glints, Indeed, Website, Referral), URL posting, tanggal ditemukan.
- **Section 3 — Detail Apply:** Tanggal kirim (*smart default: hari ini*), waktu kirim, metode lamaran, status awal, dan aturan follow-up (3, 5, 7, atau 14 hari).
- **Section 4 — Dokumen:** Referensi spesifik versi CV yang digunakan (contoh: *CV Business Development v3*), link portfolio web (`portofolio-bayuakbar.my.id`), dan cover letter.
- **Section 5 — Catatan & Tag:** Rich notes kualifikasi dan tag/label kustom.

### 4. Detail Lamaran & Timeline Vertikal (PRD §17 - §22, §37)
- **Application Summary:** Ringkasan lengkap lamaran dan tombol akses ke link lowongan asli.
- **Dokumen Terlampir:** Menampilkan versi CV dan portfolio spesifik yang digunakan pada lamaran tersebut.
- **Recruiter Contact:** Informasi Talent Acquisition (nama, jabatan, link WhatsApp langsung, email, LinkedIn).
- **Vertical Activity Timeline:** Riwayat kronologis interaksi (Applied, Viewed, Screening, HR Interview, Technical Test, User Interview, Offer, Rejected, Follow-up).
- **Add Activity Modal:** Mencatat interaksi baru lengkap dengan tanggal, jam, channel (Google Meet, Zoom, WA, dll), dan lampiran.

### 5. Follow-Up Engine (PRD §23 - §25)
- Pengelompokan cerdas:
  - 🔴 **Overdue:** Lamaran yang telah melewati tenggat jadwal follow-up.
  - 🟠 **Today:** Follow-up yang jatuh tempo hari ini.
  - 🟢 **Upcoming:** Jadwal follow-up mendatang.
  - ✅ **Completed:** Arsip log follow-up yang sudah dilakukan.
- Modal pencatatan follow-up dengan channel, pesan, dan penjadwalan follow-up berikutnya.

### 6. Document Library & CV Versioning (PRD §26 - §28)
- **CV Version Management:** Arsip CV dengan penomoran versi (v1, v2, v3) dan penghitung berapa lamaran yang menggunakan versi tersebut.
- **Portfolio Management:** Mendukung portfolio website (`https://portofolio-bayuakbar.my.id/`) dan berkas deck PDF.
- **Cover Letter Templates:** Arsip surat lamaran kerja.

### 7. Kalender & Agenda Aktivitas (PRD §36)
- Kalender bulanan interaktif dengan indikator visual tanggal kegiatan interview, tes, atau follow-up.
- Daftar agenda per tanggal untuk melihat jadwal secara kronologis.

### 8. Analytics & Recruitment Funnel (PRD §31 - §35)
- **Tingkat Konversi:** *Response Rate*, *Interview Rate*, dan *Offer Rate*.
- **Recruitment Funnel:** Visualisasi corong dari Total Applications → Responses → Screening → Interviews → Final Stage → Offer.
- **Grafik Interaktif:**
  - *Applications Over Time* (Tren bulanan dengan area chart).
  - *Applications by Platform* (Distribusi platform lowongan).
  - *Status Breakdown* (Komposisi status lamaran).

### 9. Pengaturan & Kepemilikan Data (PRD §40, §44)
- **Profil Pelamar:** Pengaturan profil nama pengguna, target peran, email, nomor telepon, dan lokasi.
- **Preferensi Default:** Konfigurasi default aturan waktu follow-up.
- **Full Data Ownership:**
  - Download backup lengkap ke format JSON.
  - Download data tabel ke format CSV.
  - Restore / Import data dari file backup JSON.
  - Reset ke Sample Demo Data atau kosongkan data.

---

## Cara Menjalankan Aplikasi

Aplikasi dibangun menggunakan **Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons, dan Recharts**.

### Mode Development (Live Reload)
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### Mode Production
```bash
npm run build
npm start
```
Aplikasi sudah siap digunakan secara optimal dan responsif baik di desktop, tablet, maupun smartphone!
