# TaniConnect

Varian desain lain dari prototipe **Digital Agriculture**: penyuluhan pertanian digital,
penghubung pasar, dan forum tanya jawab pertanian. Tujuan, fitur, dan skema data **sama persis**
dengan versi sebelumnya (`digital-agriculture-forum`) — perbedaannya ada pada **tema visual dan
tata letak**:

| Aspek          | Versi sebelumnya                  | TaniConnect (versi ini)                     |
| -------------- | ----------------------------------- | --------------------------------------------- |
| Navigasi       | Navbar di bagian atas               | Sidebar tetap di sisi kiri (desktop)          |
| Palet warna    | Hijau korporat                      | Terracotta/krem "panen senja"                 |
| Tipografi      | Satu jenis huruf (sans-serif)       | Kombinasi serif tampilan (Fraunces) + Inter   |
| Kartu          | Sudut membulat sedang, bayangan tipis | Sudut sangat membulat, bayangan lembut (soft) |
| Filter kategori| Dropdown `<select>`                 | Chip pil (pill) yang dapat diklik langsung    |
| Beranda        | Daftar langsung                     | Kartu statistik ala bento di atas daftar      |

Dibangun dengan **SvelteKit**, **Supabase** (Auth, Database, Storage), **TailwindCSS**, siap
di-deploy ke **Vercel**.

---

## 1. Gambaran Arsitektur Sistem

Arsitektur, alur autentikasi, alur penyimpanan data, dan alur unggah gambar **identik** dengan
versi sebelumnya, karena hanya lapisan tampilan (presentation layer) yang diubah.

### Alur Autentikasi

```text
Pengguna → Tombol "Masuk dengan Google" (sidebar / src/routes/login)
        → supabase.auth.signInWithOAuth({ provider: 'google' })
        → Layar Persetujuan Google
        → Redirect ke /auth/callback?code=xxxx
        → exchangeCodeForSession(code)  (src/routes/auth/callback/+server.ts)
        → Sesi disimpan pada cookie HttpOnly (dikelola oleh @supabase/ssr)
        → Trigger SQL `handle_new_user` otomatis membuat baris di tabel `profiles`
        → Pengguna diarahkan kembali ke beranda dalam kondisi sudah masuk (logged in)
```

### Alur Penyimpanan Data (Membuat Pertanyaan)

```text
Formulir (src/routes/questions/new)
        → Form Action `default` (+page.server.ts)
        → Validasi di server (judul, isi, kategori)
        → (Jika ada gambar) Unggah ke Supabase Storage bucket "question-images"
        → INSERT ke tabel `questions` (dengan RLS: auth.uid() = user_id)
        → Redirect ke halaman detail /questions/[id]
```

### Alur Unggah Gambar

```text
<input type="file">
     → FormData (multipart/form-data)
     → Server Action menerima File
     → supabase.storage.from('question-images').upload(`${user.id}/${uuid}.ext`, file)
     → getPublicUrl() menghasilkan URL publik
     → URL disimpan pada kolom `questions.image_url`
```

### Hubungan Antar Komponen (Tata Letak Sidebar)

```text
┌──────────────┐      ┌────────────────────┐      ┌────────────────────┐
│   Sidebar     │      │   Browser            │◄────►│  Supabase Project   │
│ (navigasi +   │◄────►│   SvelteKit App       │      │  - Auth (Google)    │
│  tombol aksi) │      │  (Vercel Edge/Node)   │      │  - PostgreSQL + RLS │
└──────────────┘      └────────────────────┘      │  - Storage          │
                                                     └────────────────────┘
```

---

## 2–3. Skema Basis Data & Kebijakan RLS

Lihat [`supabase/schema.sql`](./supabase/schema.sql) — skema tabel (`profiles`, `categories`,
`questions`, `answers`, `bookmarks`), trigger otomatisasi, bucket Storage `question-images`,
beserta seluruh kebijakan Row Level Security. **Skrip ini sama persis secara fungsional** dengan
versi sebelumnya, sehingga kedua prototipe dapat memakai proyek Supabase yang sama bila
diinginkan.

Ringkasan kebijakan utama:

| Tabel        | SELECT         | INSERT                     | UPDATE / DELETE  |
| ------------ | -------------- | --------------------------- | ------------------ |
| `profiles`   | Publik          | (otomatis via trigger)      | Hanya pemilik       |
| `categories` | Publik          | —                            | —                   |
| `questions`  | Publik          | Hanya pengguna masuk (login) | Hanya pemilik       |
| `answers`    | Publik          | Hanya pengguna masuk (login) | Hanya pemilik       |
| `bookmarks`  | Hanya pemilik    | Hanya untuk diri sendiri     | Hanya pemilik       |

---

## 4. Struktur Folder Proyek

```text
tani-connect/
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.js       # Palet "panen senja" + font Fraunces/Inter
├── postcss.config.js
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── static/
│   └── favicon.png
├── supabase/
│   └── schema.sql
└── src/
    ├── app.html               # Memuat Google Fonts (Fraunces + Inter)
    ├── app.css                # Kelas utilitas: tombol pil, kartu, chip
    ├── app.d.ts
    ├── hooks.server.ts
    ├── lib/
    │   ├── supabaseClient.ts
    │   ├── database.types.ts
    │   └── components/
    │       ├── Sidebar.svelte       # Pengganti Navbar: navigasi sisi kiri
    │       ├── Footer.svelte
    │       ├── PrivacyBanner.svelte
    │       ├── QuestionCard.svelte  # Tata letak horizontal, gambar besar di kiri
    │       └── CategorySelector.svelte
    └── routes/
        ├── +layout.svelte         # Tata letak sidebar + konten
        ├── +layout.server.ts
        ├── +page.svelte           # Beranda: hero, kartu statistik, chip filter
        ├── +page.server.ts
        ├── login/+page.svelte
        ├── auth/callback/+server.ts
        ├── logout/+server.ts
        ├── cari/+page.server.ts
        └── questions/
            ├── new/
            │   ├── +page.svelte
            │   └── +page.server.ts
            └── [id]/
                ├── +page.svelte
                └── +page.server.ts
```

---

## 5. Konfigurasi Supabase

1. Buat proyek baru di [supabase.com](https://supabase.com) (atau gunakan proyek yang sama
   dengan versi sebelumnya, karena skemanya identik).
2. Salin **Project URL** dan **anon public key** dari *Project Settings → API*.
3. Salin `.env.example` menjadi `.env` dan isi kedua nilai tersebut:

	```bash
	cp .env.example .env
	```

4. Instal seluruh dependensi:

	```bash
	npm install
	```

---

## 6–7. Kode SvelteKit & TailwindCSS

Seluruh kode telah dituliskan lengkap pada struktur folder di atas, dengan komentar pada
bagian-bagian penting. Perubahan visual utama dibanding versi sebelumnya ada pada
`tailwind.config.js` (palet warna & font), `src/app.css` (tombol berbentuk pil, kartu dengan
sudut sangat membulat, chip filter), serta komponen `Sidebar.svelte` yang menggantikan pola
navbar atas dengan navigasi tetap di sisi kiri untuk tampilan desktop.

---

## 8. Panduan Deploy ke Vercel

1. **Siapkan Google OAuth**
   - [Google Cloud Console](https://console.cloud.google.com/) → *APIs & Services → Credentials*
     → buat *OAuth Client ID* bertipe *Web application*.
   - Tambahkan *Authorized redirect URI*: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Di Dashboard Supabase: *Authentication → Providers → Google*, aktifkan dan masukkan
     *Client ID* & *Client Secret*.

2. **Jalankan migrasi SQL**
   - Buka *SQL Editor* pada Dashboard Supabase, tempel seluruh isi `supabase/schema.sql`,
     lalu jalankan (Run).

3. **Jalankan proyek secara lokal**

	```bash
	npm install
	npm run dev
	```

	Buka `http://localhost:5173`.

4. **Deploy ke Vercel**
   - Unggah repositori ke GitHub/GitLab, lalu impor proyek di [vercel.com](https://vercel.com).
   - Adapter `@sveltejs/adapter-vercel` sudah dikonfigurasi pada `svelte.config.js`.
   - Tambahkan *Environment Variables*: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`.
   - Tambahkan `https://nama-proyek.vercel.app/auth/callback` ke *Supabase → Authentication →
     URL Configuration → Redirect URLs*.
   - Klik *Deploy*.

---

## 9. Daftar Pengembangan Lanjutan

- Sistem reputasi/poin (upvote/downvote) untuk pertanyaan dan jawaban.
- Menandai jawaban sebagai "jawaban terbaik" (accepted answer).
- Halaman profil publik per pengguna beserta riwayat pertanyaan/jawaban.
- Fitur Penghubung Pasar (Market Linkage): katalog produk hasil panen, harga, dan pemasok
  sarana produksi pertanian sebagai modul terpisah.
- Notifikasi (email/real-time via Supabase Realtime) saat pertanyaan dijawab.
- Panel moderasi konten untuk penyuluh/admin.
- Mode gelap (dark mode) memanfaatkan palet terracotta yang sudah disiapkan.
- Dukungan multi-bahasa (i18n) untuk memperluas jangkauan pengguna.
- Progressive Web App (PWA) agar dapat digunakan secara luring di area dengan konektivitas
  terbatas.
