# Frontend Dasawisma — Sistem Manajemen Keuangan & ZIS

Aplikasi web **Single Page Application (SPA)** untuk pengelolaan keuangan
Dasawisma (kas RT/RW) sekaligus pengelolaan dana **ZIS** (Zakat, Infaq,
Sedekah). Dibangun dengan **React + Vite** dan dilengkapi sistem autentikasi
berbasis token serta hak akses (role-based access) untuk tiga peran pengguna:
**Koordinator**, **Anggota (Kader)**, dan **Amil Zakat**.

---

## ✨ Fitur Utama

- **Autentikasi & Sesi** — login, lupa/reset password, validasi sesi otomatis
  tiap 60 detik dan saat tab kembali aktif.
- **Hak Akses per Peran (RBAC)** — setiap peran memiliki dashboard, menu, dan
  layout sendiri.
- **Manajemen Kas Dasawisma** — catat pemasukan/pengeluaran kas, lihat saldo,
  grafik, dan ekspor laporan PDF.
- **Manajemen ZIS** — pencatatan ZIS (muzakki/mustahik), filter & pencarian,
  perhitungan total real-time, ekspor PDF.
- **Halaman Publik** — beranda, dashboard ringkasan, dan info ZIS yang dapat
  diakses tanpa login.
- **UX** — animasi transisi halaman (Framer Motion), dialog interaktif
  (SweetAlert2), dan tampilan responsif (Tailwind CSS).

---

## 🛠️ Teknologi

| Kategori        | Library                                        |
| --------------- | ---------------------------------------------- |
| Framework       | React 19                                       |
| Build Tool      | Vite 8                                         |
| Routing         | react-router-dom 7                             |
| State Global    | Zustand 5                                      |
| HTTP Client     | Axios 1                                        |
| Styling         | Tailwind CSS 3, PostCSS, Autoprefixer          |
| Komponen UI     | lucide-react (ikon), react-select              |
| Grafik          | Recharts                                       |
| Animasi         | Framer Motion                                  |
| Dialog/Alert    | SweetAlert2                                    |
| Ekspor PDF      | jsPDF, jspdf-autotable                         |
| Linting         | ESLint 9                                       |

---

## 🚀 Memulai

### Prasyarat

- **Node.js** versi 18 atau lebih baru
- **npm** (atau pnpm/yarn)
- Backend API yang sudah berjalan (default `http://localhost:3000`)

### Instalasi

```bash
# masuk ke folder frontend
cd Frontend-TA

# install dependencies
npm install
```

### Konfigurasi Environment

Buat file `.env` di root `Frontend-TA` (lihat `.env.example` sebagai acuan).

> ⚠️ **Penting:** Vite hanya membaca variabel yang berawalan `VITE_`. Kode di
> proyek ini membaca `import.meta.env.VITE_API_URL`, jadi gunakan nama tersebut:

```env
# URL backend API
VITE_API_URL=http://localhost:3000
```

### Menjalankan

```bash
# mode development (hot reload) → http://localhost:5173
npm run dev

# build untuk produksi
npm run build

# pratinjau hasil build
npm run preview

# cek kualitas kode
npm run lint
```

---

## 📁 Struktur Proyek

```
Frontend-TA/
├── public/                 # aset statis
├── src/
│   ├── assets/             # logo & gambar
│   ├── components/
│   │   ├── layout/         # kerangka per peran (Layout + Sidebar + Footer)
│   │   └── shared/         # komponen reusable (kartu, tabel, chart, dll.)
│   ├── pages/
│   │   ├── auth/           # Login, LupaPassword
│   │   ├── koordinator/    # halaman peran Koordinator
│   │   ├── anggota/        # halaman peran Anggota/Kader
│   │   ├── Amil/           # halaman peran Amil Zakat
│   │   └── publik/         # halaman tanpa login
│   ├── routes/             # ProtectedRoute (penjaga rute)
│   ├── services/           # lapisan komunikasi API (Axios)
│   ├── store/              # state global (Zustand)
│   ├── utils/              # helper (format Rupiah, tanggal, ekspor PDF)
│   ├── App.jsx             # definisi rute & bootstrap autentikasi
│   └── main.jsx            # entry point React
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🧱 Arsitektur

Aliran data mengikuti pola berlapis:

```
UI (pages/components) → State (Zustand) → Service (Axios) → Backend API
```

### Autentikasi & Sesi

- **`store/useAuthStore.js`** — menyimpan `user`, `token`, `role` (Zustand),
  dengan persistensi ke `localStorage`.
- **`App.jsx` › `AuthBootstrapper`** — saat token ada, memuat ulang profil
  (`getMe`) dan memvalidasi sesi secara berkala.
- **`routes/ProtectedRoute.jsx`** — memblokir akses tanpa token / peran yang
  tidak sesuai, mengarahkan ke `/login`.

### Lapisan Service (Axios)

Terdapat dua instance:

- **`services/api.js`** — instance **ber-token**. Request interceptor otomatis
  menambahkan header `Authorization: Bearer <token>`; response interceptor
  menangani error `401/403` dengan logout otomatis + redirect ke login.
- **`services/apiPublic.js`** — instance **tanpa token** untuk endpoint publik.

### Peran & Rute

| Peran           | Role string                   | Prefix Rute   | Layout            |
| --------------- | ----------------------------- | ------------- | ----------------- |
| Koordinator     | `penanggung jawab dasawisma`  | `/...`        | `DashboardLayout` |
| Anggota (Kader) | `kader dasawisma`             | `/anggota/...`| `AnggotaLayout`   |
| Amil Zakat      | `amil zakat`                  | `/amil/...`   | `AmilLayout`      |

---

## 📜 Skrip yang Tersedia

| Perintah          | Keterangan                          |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Menjalankan server pengembangan     |
| `npm run build`   | Build aplikasi untuk produksi       |
| `npm run preview` | Pratinjau hasil build secara lokal  |
| `npm run lint`    | Menjalankan ESLint                  |

---

## 📝 Catatan

- Proyek ini adalah bagian **frontend**; pastikan backend API berjalan dan
  `VITE_API_URL` menunjuk ke alamat yang benar.
- Token disimpan di `localStorage` dengan kunci `dasawisma_token` (mendukung
  kunci lama `token` untuk kompatibilitas).
