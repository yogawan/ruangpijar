# User Journey — RuangPijar

Dokumen ini memetakan alur pengguna dan cara kerja lima fitur utama RuangPijar:
**Auth Flow, Check-in, Jejak, Insight, dan Ruang** — ditulis langsung dari kode
yang berjalan (`app/`, `lib/`, `models/`), bukan dari spesifikasi awal atau
salinan materi pemasaran. Tujuannya jadi satu acuan yang bisa dipegang saat
mengembangkan, meninjau, atau menulis pengujian untuk fitur-fitur ini.

**Metodologi.** Setiap klaim di sini ditelusuri sampai ke file sumbernya
(disebutkan sebagai `path/file.ts`) dan disilangkan dengan `docs/openapi.json`.
Bagian yang tidak punya implementasi jelas ditandai `TBD` — lihat
[Daftar TBD Terkonsolidasi](#daftar-tbd-terkonsolidasi) untuk rekapnya.

> Ditulis dalam Bahasa Indonesia mengikuti bahasa UI dan komentar kode
> RuangPijar sendiri. Nama field, enum, dan endpoint dibiarkan apa adanya
> (bahasa Inggris) karena itu yang benar-benar tertulis di kode.

---

## Daftar Isi

1. [Ringkasan Arsitektur](#ringkasan-arsitektur)
2. [Model Data Inti](#model-data-inti)
3. [Fitur 1 — Auth Flow](#fitur-1--auth-flow)
4. [Fitur 2 — Check-in](#fitur-2--check-in)
5. [Fitur 3 — Jejak](#fitur-3--jejak)
6. [Fitur 4 — Insight](#fitur-4--insight)
7. [Fitur 5 — Ruang](#fitur-5--ruang)
8. [Fitur Pendukung Lintas Halaman](#fitur-pendukung-lintas-halaman)
9. [Referensi Endpoint API](#referensi-endpoint-api)
10. [Daftar TBD Terkonsolidasi](#daftar-tbd-terkonsolidasi)
11. [Ketidaksesuaian Marketing vs Implementasi](#ketidaksesuaian-marketing-vs-implementasi)
12. [Variabel Lingkungan](#variabel-lingkungan)

---

## Ringkasan Arsitektur

**Stack.** Next.js 16 (App Router) + React 19 + TypeScript, MongoDB via
Mongoose, NextAuth v5 (beta) untuk autentikasi (strategi JWT), Tailwind v4,
GSAP untuk animasi, react-joyride untuk tur onboarding, Cloudinary untuk
avatar, Nodemailer (Gmail SMTP) untuk email pengingat streak, Vercel Cron
untuk sapuan harian streak.

**Loop produk.** Navigasi aplikasi (`components/NavbarGlobal.tsx`) dan salinan
landing page sama-sama membingkai lima fitur inti sebagai satu siklus:

```
Check-in  →  Jejak  →  Insight  →  Ruang
(Record)     (Recall)   (Understand) (Act)
   ↑_____________________________________|
```

**Pola penjagaan sesi (auth guard).** Tidak ada `middleware.ts` di root
proyek. Penjagaan sesi terjadi di dua lapis yang berbeda:

- `app/auth/login/page.tsx` dan `app/auth/register/page.tsx` adalah Server
  Component: memanggil `getCurrentUserId()` (`lib/session.ts`) dan
  `redirect("/check-in")` **sebelum** apa pun dikirim ke browser, kalau sesi
  sudah ada. Ini satu-satunya redirect sisi server di seluruh aplikasi.
- Semua halaman aplikasi lainnya (`/check-in`, `/jejak`, `/insight`, `/ruang`,
  `/profile`, `/onboarding`, dan seluruh rute `[id]`) adalah Client Component
  yang melakukan `fetch` saat mount, lalu `router.replace("/auth/login")` kalau
  responsnya `401`. Konsekuensinya: pengunjung yang belum login akan **sempat
  melihat kerangka/loading state halaman** selama sepersekian detik sebelum
  dilempar ke login — bukan bug keamanan (API tetap menolak dengan 401), tapi
  pola UX yang konsisten di seluruh app dan penting diketahui saat menulis
  pengujian E2E.

**Konvensi API bersama** (`lib/http.ts`):

| Situasi | Respons |
| --- | --- |
| Tidak ada sesi | `401 { error: "Unauthorized" }` |
| Body bukan JSON valid | `400 { error: "Invalid JSON body" }` |
| Gagal validasi skema Mongoose | `400 { error: "Validation failed", details: { field: message } }` |
| ObjectId tidak valid (`CastError`) | `400 { error: "Invalid identifier" }` |
| Dokumen tidak ditemukan / bukan milik user | `404 { error: "... not found" }` |
| Error tak terduga | `500 { error: "Internal server error" }` (di-log ke server) |
| Paginasi (`?page&limit`) | default `limit=20`, maksimum `limit=100`, `page` minimum `1` |

Pola `404` untuk dokumen yang bukan milik user (bukan `403`) berlaku
konsisten: setiap query selalu menyaring `{ _id, userId }` bersamaan, jadi
mencoba mengakses data user lain terasa persis seperti data itu tidak pernah
ada.

---

## Model Data Inti

Ringkasan field-field yang dipakai lintas fitur (lihat `models/*.ts` untuk
definisi lengkap):

| Model | Field kunci | Dipakai oleh |
| --- | --- | --- |
| `User` | `currentStreak`, `lastCheckInAt`, `lastReminderSentAt`, `onboardingCompleted` (lihat catatan TBD), `googleId`, `passwordHash` | Auth, Check-in (streak), cron |
| `CheckIn` | `mood`(1–5), `energy`/`stress`(1–10), `sleepHours`/`academicLoad`/`socialLoad`(opsional), `factors[]`, `reflection`, `checkedInAt` | Check-in, Jejak, Insight, Ruang (rekomendasi) |
| `Insight` | `type`, `metric`/`relatedMetric`, `confidence`, `periodStart`/`periodEnd`, `isRead` | Insight, Jejak (feed) |
| `Action` | `title`, `type`, `durationMinutes`, `relatedFactors[]`, `isActive` | Ruang |
| `ActionLog` | `userId`, `actionId`, `status` (`STARTED`/`COMPLETED`/`SKIPPED`), `startedAt`, `completedAt` | Ruang, Jejak (feed) |
| `Personalization` | `focusAreas[]`, `checkInFrequency`, `preferredCheckInTime`, `onboardingCompleted` | Onboarding, Profil — **lihat TBD:** tidak dibaca ulang oleh fitur lain |

---

## Fitur 1 — Auth Flow

### Tujuan

Membawa pengunjung anonim menjadi akun yang bisa memakai fitur inti, lewat
email/password atau Google, lalu menangkap preferensi dasar (onboarding)
sebelum masuk ke `/check-in`.

### Screen yang terlibat

| Rute | Peran |
| --- | --- |
| `/` | Landing page marketing, CTA ke register/login |
| `/auth/login` (`app/auth/login/page.tsx` + `login-view.tsx`) | Form login |
| `/auth/register` (`app/auth/register/page.tsx` + `register-view.tsx`) | Form registrasi |
| `/onboarding` | Wizard 3 langkah personalisasi, wajib dilalui setiap kali baru login |
| `/profile` | Tempat sign-out dan mengubah ulang preferensi (lihat [Fitur Pendukung](#fitur-pendukung-lintas-halaman)) |

### Alur A — Registrasi email/password

1. Dari `/`, klik "Mulai Check-in" → `/auth/register`. Kalau sudah ada sesi
   aktif, server langsung `redirect` ke `/check-in` tanpa menampilkan form.
2. Isi Nama, Email, Password (≥8 karakter), Konfirmasi Password. Validasi
   `password === confirmPassword` dilakukan di klien sebelum submit.
3. Submit → `POST /api/auth/register { name, email, password }`.
   - Server memvalidasi: nama tidak kosong, format email via regex, panjang
     password ≥8.
   - Email sudah terdaftar → `409`. Ada penanganan race condition eksplisit:
     kalau dua request registrasi dengan email sama lolos pengecekan
     `exists()` bersamaan, index unik Mongo akan menolak salah satunya
     (`code 11000`) dan itu juga dipetakan ke `409`, bukan `500`.
   - Sukses → hash password dengan bcrypt (12 rounds), buat `User`, balas
     `201 { id, name, email }`.
4. **Registrasi tidak otomatis login.** Sukses → `router.push("/auth/login")`;
   pengguna harus login manual setelahnya.
5. Pemetaan pesan error: `400` → "Ada data yang belum sesuai...", `409` →
   "Email ini sudah terdaftar. Coba masuk saja.", gagal jaringan → pesan
   koneksi generik.

### Alur B — Login email/password

1. Di `/auth/login` (guard server-side yang sama seperti register).
2. Submit → `signIn("credentials", { redirect: false })` dari next-auth.
3. `auth.ts` (`Credentials.authorize`): cari `User` by email (dengan
   `.select("+passwordHash")` karena field ini `select:false` secara
   default), lalu `bcrypt.compare`. Mengembalikan `null` (gagal) kalau email
   tidak ditemukan, **atau user itu tidak punya `passwordHash` sama sekali**
   (akun yang dibuat lewat Google), atau password salah.
4. Sukses → sesi JWT terbentuk → `router.push("/onboarding")` +
   `router.refresh()`.
5. Gagal → pesan tunggal "Email atau password belum cocok." — sengaja tidak
   membedakan penyebab (email tak dikenal vs password salah vs akun
   Google-only) supaya tidak membocorkan status pendaftaran suatu email.

### Alur C — Google OAuth (dipakai untuk login *dan* register)

Tombol "Lanjutkan dengan Google" (login) dan "Daftar dengan Google" (register)
memanggil hal yang identik: `signIn("google", { redirectTo: "/onboarding" })`.

Logika ada di `auth.ts`, callback `jwt`:

- Sesi Google pertama untuk suatu email → `User` dicari by email;
  - Belum ada → dibuat baru (`name` dari profil Google atau bagian sebelum
    `@`, `avatarUrl` dari foto Google, `googleId` diisi).
  - Sudah ada (misalnya sebelumnya daftar via email/password) tapi belum
    punya `googleId` → **ditautkan otomatis** by email match (`googleId`
    diisi ke akun yang sudah ada). Sejak itu akun itu bisa login lewat kedua
    cara — asalkan passwordnya juga pernah diset.
- Callback `signIn` menolak (return `false`) kalau provider Google tidak
  mengembalikan email sama sekali — kasus langka.

### Onboarding — wizard personalisasi (`/onboarding`)

- **Tujuan:** mengisi dokumen `Personalization` (`focusAreas`,
  `checkInFrequency`, `preferredCheckInTime`).
- **Tidak dijaga status selesai.** Setiap login/registrasi sukses selalu
  diarahkan ke `/onboarding` — tidak ada pengecekan `onboardingCompleted` di
  mana pun yang melompati wizard ini untuk pengguna lama. `GET
  /api/personalization` bersifat upsert, jadi pengguna baru mendapat form
  kosong dan pengguna lama mendapat form terisi ulang dari jawaban
  terakhirnya (lihat `editablePersonalization()` di
  `lib/personalization-labels.ts`). Secara efektif, **setiap kali login,
  pengguna lama tetap melewati 3 langkah wizard ini lagi** (walau sudah
  terisi otomatis) sebelum sampai ke `/check-in`.
- 3 langkah, disimpan hanya di state komponen sampai langkah terakhir: (1)
  `focusAreas` (checkbox multi-pilih, opsional), (2) `checkInFrequency`
  (radio, default `DAILY`), (3) `preferredCheckInTime` (input time, opsional).
- Submit langkah terakhir → `PATCH /api/personalization` dengan
  `{ ...form, onboardingCompleted: true }` (server juga mengisi
  `onboardingCompletedAt`) → `router.push("/check-in")`.
- Bisa diubah lagi kapan saja lewat `/profile` → bagian "Preferensi" (endpoint
  `PATCH` yang sama, tanpa mengirim `onboardingCompleted`).

### Sesi & Logout

- Sesi memakai strategi JWT NextAuth; `getCurrentUserId()` (`lib/session.ts`)
  adalah satu-satunya titik yang dipakai seluruh API route untuk membaca
  identitas pengguna.
- Logout hanya tersedia dari `/profile` → tombol "Keluar" →
  `signOut({ redirectTo: "/auth/login" })`.

### State & Edge Case

| Situasi | Perilaku saat ini |
| --- | --- |
| Link "Lupa password?" di `/auth/login` | **TBD** — mengarah ke `/forgot-password`, rute ini tidak ada sama sekali (tidak ada page maupun API). Link mati. |
| Reset/ubah password, hapus akun, set password untuk akun Google-only | **TBD** — tidak ada UI maupun endpoint untuk semuanya. |
| Verifikasi email saat registrasi | **TBD** — tidak diimplementasikan; akun langsung aktif setelah `POST /api/auth/register`. |
| Error OAuth (mis. `OAuthAccountNotLinked`) | **TBD** — NextAuth tidak dikonfigurasi dengan `pages.error` kustom, jadi jatuh ke halaman error bawaan NextAuth yang tidak mengikuti desain RuangPijar. |
| `User.onboardingCompleted` (field di model `User`, terpisah dari `Personalization.onboardingCompleted`) | **TBD** — field ini ada di skema dan bisa diterima `PATCH /api/me`, tapi tidak ada satu pun layar yang mengirimkannya. Efektif tidak terpakai. |
| Sudah login lalu buka `/auth/login` atau `/auth/register` | Redirect paksa ke `/check-in`, melompati `/onboarding` sepenuhnya. |
| Login credentials ke akun yang dibuat lewat Google (tidak ada `passwordHash`) | Gagal dengan pesan generik yang sama seperti password salah. |
| Submit ganda (double-submit) form login/register | Dicegah dengan `disabled` pada tombol selama `pending`; tidak ada guard di server selain unique index email. |

---

## Fitur 2 — Check-in

### Tujuan

Pencatatan harian singkat (mood, energi, stres, dan beberapa data opsional)
yang menjadi sumber utama untuk streak, Jejak, generasi Insight, dan
rekomendasi Ruang.

### Screen yang terlibat

| Rute | Peran |
| --- | --- |
| `/check-in` | Buat check-in baru (wizard 5 langkah) |
| `/check-in/[id]` | Lihat detail satu check-in |
| `/check-in/[id]/edit` | Ubah check-in yang sudah ada |
| `StreakPopup` (dialog, bukan rute) | Perayaan saat streak naik, dipicu dari `/check-in` |

Form dibagikan lewat satu komponen (`components/check-in-form.tsx`) antara
create dan edit, supaya markup-nya tidak terduplikasi.

### Data yang direkam

`mood` (1–5, wajib) · `energy`, `stress` (1–10, wajib, default slider 5) ·
`sleepHours` (0–24, opsional) · `academicLoad`, `socialLoad` (1–10, opsional)
· `factors[]` (multi-pilih dari 9 nilai, opsional) · `reflection` (teks bebas
≤2000 karakter, opsional) · `checkedInAt` (otomatis "sekarang" saat dibuat,
**tidak pernah dikirim ulang saat edit** — lihat di bawah).

### Alur — Membuat check-in

1. Masuk dari navbar ("Check-in"), atau CTA kosong di halaman Jejak/landing.
2. Wizard 5 langkah di `CheckInForm`: (1) pilih mood via emoji wajah [wajib —
   radio `required` mencegah lanjut tanpa jawaban], (2) slider energi & stres,
   (3) jam tidur / beban akademik / beban sosial (semua opsional, dikosongkan
   berarti `null`, bukan `0`), (4) faktor yang memengaruhi (opsional,
   multi-pilih), (5) refleksi bebas (opsional).
3. "Lanjut" memajukan langkah; "Kembali" mundur. **Progres wizard hanya ada di
   state React** — refresh atau menutup tab di tengah jalan menghilangkan
   semuanya (tidak ada draft/local-storage).
4. Langkah terakhir → `POST /api/check-ins` dengan 8 field di atas.
5. Server menyimpan `CheckIn`, lalu **secara best-effort** menghitung ulang
   streak (`nextStreakState`, `lib/streak.ts`) dan menyimpannya ke `User`.
   Kegagalan di langkah streak ini **tidak** menggagalkan check-in itu sendiri
   — hanya dicatat ke log server, dan klien menerima `streak: null`.
6. Respons `201` membawa `{ ...checkIn, streak: { current, increased } | null }`.
7. Kalau `streak.increased === true` → `StreakPopup` muncul (dialog native,
   animasi GSAP dilewati di bawah `prefers-reduced-motion`), menutupnya
   (tombol/Esc/klik backdrop) baru mengarahkan ke `/jejak`.
8. Kalau tidak naik (check-in kedua di hari yang sama, atau bookkeeping streak
   gagal) → langsung ke `/jejak` tanpa popup.

### Cara kerja streak (`lib/streak.ts`)

`nextStreakState(current, checkInAt)`, dibandingkan lewat `dayKey()`
(`lib/calendar.ts`, **zona waktu lokal browser**, bukan UTC — supaya check-in
larut malam WIB tidak tergeser ke hari berikutnya):

| Selisih hari dari check-in terakhir | Hasil |
| --- | --- |
| Belum pernah check-in | Streak mulai dari `1` |
| `0` (hari kalender sama) | Streak tidak berubah — check-in kedua di hari yang sama tidak dihitung dobel |
| `1` | Streak `+1` |
| `≥2` | Streak sudah putus, mulai ulang dari `1` |
| `<0` (checkedInAt lebih awal dari catatan terakhir) | Dibiarkan, tidak menulis ulang riwayat |

**Sapuan harian di luar sesi pengguna** (`/api/cron/streak-check`, satu-satunya
proses latar belakang di seluruh aplikasi): dijadwalkan `vercel.json` jam
01:00 UTC setiap hari, diamankan header `Authorization: Bearer $CRON_SECRET`
(bukan sesi login). Untuk tiap user dengan streak aktif:
- Sudah diam ≥`STREAK_GRACE_DAYS` (3) hari → streak direset ke `0` + email
  "streak sudah hangus".
- Diam 1–2 hari dan belum diberi pengingat hari ini (`lastReminderSentAt`) →
  email pengingat (redaksi beda untuk "besok hangus" vs "hari ini").
- `lastReminderSentAt` di-reset ke `null` setiap kali user check-in lagi, jadi
  siklus pengingat mulai bersih di keterlambatan berikutnya.

### Alur — Lihat detail (`/check-in/[id]`)

- `GET /api/check-ins/[id]` (difilter `{ _id, userId }`). Status: `loading` →
  `ready`, atau `missing` (menyamakan `404` dan `400` id salah format — dari
  sudut pandang pengguna keduanya sama-sama "tidak ketemu"), atau `error`
  (jaringan/500).
- Statistik yang ditampilkan (`statsFor()`) hanya field yang benar-benar
  diisi — beban akademik/sosial/tidur yang dikosongkan tidak muncul sebagai
  placeholder kosong.
- Tombol "Ubah" → halaman edit; "Hapus" → konfirmasi inline ("Catatannya
  tidak bisa dikembalikan") → `DELETE`, sukses (`204`) → `router.push("/jejak")`.

### Alur — Ubah check-in (`/check-in/[id]/edit`)

- Memuat nilai saat ini lewat `GET`, lalu `PATCH /api/check-ins/[id]` dengan
  field yang sama **kecuali `checkedInAt`** — sengaja tidak pernah dikirim,
  supaya mengoreksi isi tidak pernah memindahkan entri ke tanggal lain.
- Sukses → `router.push("/check-in/[id]")` (kembali ke halaman detail).

### State & Edge Case

| Situasi | Perilaku saat ini |
| --- | --- |
| Lebih dari satu check-in di hari yang sama | Diizinkan penuh, tidak ada constraint unik. Kalender di Jejak menandainya dengan badge angka. |
| Menghapus atau mengubah check-in setelah streak naik | **TBD/keterbatasan** — `currentStreak` tidak dihitung ulang saat edit maupun delete; hanya `POST` yang menyentuh streak. Menghapus check-in hari ini setelah popup streak muncul tidak menurunkan angkanya. |
| Field opsional dikosongkan | Dikirim sebagai `null` eksplisit (`optionalNumber("")`), bukan `0` — angka `0` yang benar-benar diisi tetap tersimpan dan tampil sebagai `0`, bukan hilang. |
| Validasi gagal di server (400 dengan `details` per-field) | UI hanya menampilkan pesan generik "Ada isian yang belum sesuai" — detail per-field dari `handleApiError` tidak ditampilkan ke pengguna. |
| 401 di tengah alur manapun (load, submit, delete) | `router.replace("/auth/login")`. |
| Submit ganda cepat | Dicegah lewat `disabled` tombol selama `pending`, tidak ada idempotency key di server. |

---

## Fitur 3 — Jejak

### Tujuan

Satu tempat untuk menoleh ke belakang: kalender check-in bulanan **plus** feed
kronologis gabungan "Latihan" (dari Ruang) dan "Insight" — mewakili peran
Recall/Record dalam loop produk.

### Screen yang terlibat

Hanya `/jejak`, dibagi dua panel (grid berdampingan di layar besar, ditumpuk
di mobile) plus dialog `CheckInDayModal` untuk detail satu tanggal.

### Cara kerja

**Panel kalender** — sepenuhnya independen dari endpoint `/api/jejak`. Ia
menelusuri `GET /api/check-ins?from&to&page&limit=100` untuk rentang bulan
yang sedang dilihat (`monthRange()`, `lib/calendar.ts`), menyapu semua
halaman kalau perlu (jarang lebih dari satu, karena satu bulan check-in wajar
muat dalam 100 item). Berganti bulan membatalkan (`AbortController`) request
bulan sebelumnya yang masih berjalan.
- Sel kosong (titik pudar) = tidak ada check-in hari itu.
- Sel terisi = warna primary + wajah mood dari check-in **pertama** hari itu,
  ditambah badge angka kalau lebih dari satu. Klik membuka `CheckInDayModal`
  berisi semua check-in hari itu (mood, statistik, faktor, refleksi, tautan
  "Lihat detail"/"Ubah" per entri).
- Tidak bisa maju ke bulan depan dari bulan berjalan (tombol dinonaktifkan) —
  masuk akal karena tidak ada yang pernah tercatat di masa depan.

**Panel "Latihan & Insight"** — memanggil `GET
/api/jejak?types=ACTION_LOG,INSIGHT&page=N`. **Sengaja mengecualikan
`CHECK_IN`** karena kalender di sebelahnya sudah mewakilinya, meskipun
endpoint `/api/jejak` sendiri mendukung dan secara default mengembalikan
ketiga tipe (`CHECK_IN`, `ACTION_LOG`, `INSIGHT`) kalau parameter `types`
tidak dikirim sama sekali — lihat `app/api/jejak/route.ts`.
- Kartu `ACTION_LOG`: judul latihan (atau "Latihan yang sudah dihapus" kalau
  `Action` sumbernya sudah tidak ada — `actionId` bisa `null` setelah
  `populate`), status (Dimulai/Selesai/Dilewati), tipe + durasi. **Tidak bisa
  diklik** — tidak ada halaman detail untuk action log.
- Kartu `INSIGHT`: tipe, judul, deskripsi — tautan ke `/insight/[id]`.
- **Paginasi berbasis heuristik**, bukan hitungan pasti: respons `/api/jejak`
  hanya membawa `items`, `page`, `limit` — **tidak ada `total`/`totalPages`**
  (menggabungkan 3 koleksi tanpa hitungan gabungan yang murah). Tombol "Muat
  lebih banyak" muncul kalau halaman terakhir persis sepenuh `limit` (20
  item) — sinyal "mungkin masih ada lagi", bukan kepastian.

### State & Edge Case

| Situasi | Perilaku saat ini |
| --- | --- |
| Belum ada check-in di bulan yang dilihat | Kalender tetap tampil (grid kosong) + teks "Belum ada check-in di bulan ini." dengan CTA ke `/check-in`. |
| Belum pernah ada latihan/insight sama sekali | Kartu kosong bermaskot + CTA ke `/ruang`. |
| Kalender gagal dimuat tapi feed berhasil (atau sebaliknya) | Dua region error terpisah (`calendarError` vs `error`) — satu bisa gagal tanpa mematikan yang lain. |
| `GET /api/jejak` di proses server yang baru | Route ini menyertakan `model: ActionModel` secara eksplisit di `.populate()` — historis pernah `MissingSchemaError` kalau model dicari by name tanpa pernah diimpor lebih dulu (lihat `docs/audit-integrasi.md` §7.2). Sudah diperbaiki di kode saat ini. |
| 401 pada salah satu dari dua fetch (kalender/feed) | `router.replace("/auth/login")`. |

---

## Fitur 4 — Insight

### Tujuan

Menyorot pola/tren/korelasi berbasis aturan (bukan diagnosis) dari check-in
milik pengguna sendiri. Baik salinan tur onboarding maupun footer situs
menegaskan ini: *"Bukan diagnosis — hanya hal yang mulai terlihat."*

### Screen yang terlibat

| Rute | Peran |
| --- | --- |
| `/insight` | Daftar + filter + tombol "Cari pola baru" |
| `/insight/[id]` | Detail satu insight |

### Cara kerja generasi insight (`lib/insight-generator.ts`)

Dikonfirmasi eksplisit di `docs/openapi.json`: *"Rule-based analysis (no
ML/LLM)"*. Tidak ada AI/LLM yang terlibat sama sekali.

- **100% manual.** Satu-satunya pemicu adalah pengguna menekan "Cari pola
  baru" di `/insight` → `POST /api/insights/generate`. Tidak ada cron, tidak
  ada trigger otomatis saat check-in dibuat, tidak ada proses latar belakang
  lain yang memanggil fungsi ini.
- Melihat check-in **14 hari terakhir** (`WINDOW_DAYS`). Kalau jumlahnya `<3`
  (`MIN_CHECK_INS`) → langsung balas `[]` dengan pesan "Belum cukup data
  untuk membuat insight baru." (status `200`, bukan error).
- Tiga jenis kandidat dievaluasi **independen** — satu pemanggilan bisa
  menghasilkan 0 sampai 3 insight sekaligus, masing-masing tersimpan sebagai
  dokumen `Insight` terpisah dengan `periodStart`/`periodEnd` yang sama:

  | Tipe | Logika | Ambang aktivasi | Confidence |
  | --- | --- | --- | --- |
  | `TREND` (mood/stres/energi, dievaluasi masing-masing) | Rata-rata paruh pertama vs paruh kedua jendela 14 hari | `\|selisih\| ≥ 0.75` | `min(1, \|selisih\|/4)` |
  | `CORRELATION` (stres ↔ tidur) | Korelasi Pearson antara `sleepHours` dan `stress` pada check-in yang mengisi jam tidur (butuh ≥3 data) | `\|r\| ≥ 0.4` | `min(1, \|r\|)` |
  | `PATTERN` (faktor dominan) | Faktor yang paling sering muncul di `factors[]` | Muncul di ≥40% check-in jendela | proporsi kemunculannya |

- **`REFLECTION`** ada di enum skema (`models/Insight.ts`) dan daftar label
  (`lib/insight-labels.ts`), tapi **tidak pernah dihasilkan** oleh generator
  saat ini — kemungkinan dicadangkan untuk jenis insight manual/berbeda di
  masa depan. **TBD.**
- Menekan "Cari pola baru" berulang kali pada data yang tidak berubah dapat
  menghasilkan insight yang isinya nyaris sama berulang kali — **tidak ada
  deduplikasi** terhadap insight yang sudah pernah dibuat untuk jendela waktu
  serupa. **TBD/keterbatasan.**

### Alur — Daftar (`/insight`)

1. Filter chip "Semua" vs "Belum dibaca" (`?isRead=false`) — mengganti filter
   memuat ulang halaman 1 dan membatalkan request sebelumnya.
2. Tiap kartu: tipe, metric (+ `relatedMetric` kalau ada), persentase
   confidence (dibulatkan, disembunyikan total kalau `null`), judul,
   deskripsi, rentang periode, status baca.
3. "Tandai sudah dibaca" → `PATCH { isRead: true }`, memperbarui kartu di
   tempat (tidak hilang dari daftar "Semua", hanya akan hilang dari filter
   "Belum dibaca" di pemuatan berikutnya).
4. "Muat lebih banyak" — di sini paginasi **akurat** (`GET /api/insights`
   memang mengembalikan `total`/`totalPages`, berbeda dari `/api/jejak`).
5. Tombol "Cari pola baru" memanggil generator (lihat di atas); pesan
   responsnya ditampilkan apa adanya, baik untuk kasus berhasil maupun "data
   belum cukup".

### Alur — Detail (`/insight/[id]`)

- **Tidak ada `GET /api/insights/{id}`.** Halaman ini menelusuri `GET
  /api/insights?page=N&limit=100` sampai `_id` yang dicari ketemu, dibatasi
  oleh `totalPages` asli — untuk riwayat yang wajar ini cukup satu request,
  tapi tetap solusi sisi klien, bukan pengambilan satu-resource yang
  sebenarnya (didokumentasikan juga di `docs/audit-integrasi.md` §3.1 sebagai
  kompromi yang disengaja, dan masih berlaku di kode saat ini).
- Field sama seperti kartu daftar, plus toggle dua arah "Tandai belum
  dibaca"/"Tandai sudah dibaca" — **satu-satunya tempat** status baca bisa
  dikembalikan ke `false` (dari daftar hanya bisa menandai *sudah* dibaca).
- Status "missing" mencakup id yang benar-benar tidak dikenal maupun id milik
  user lain (daftar sumbernya memang selalu hanya berisi insight milik
  pengguna sendiri, jadi tidak ada kebocoran data).

### State & Edge Case

| Situasi | Perilaku saat ini |
| --- | --- |
| `confidence` bernilai `null` | Disembunyikan total, bukan ditampilkan sebagai `0%`. |
| `relatedMetric` | Hanya diisi untuk tipe `CORRELATION` saat ini — satu-satunya kandidat yang menyertakannya. |
| Belum pernah check-in sama sekali vs jendela 14 hari terlalu sedikit datanya | Tidak bisa dibedakan dari sisi UI — keduanya menampilkan pesan "Belum cukup data..." yang sama. |
| 401 di titik manapun | `router.replace("/auth/login")`. |

---

## Fitur 5 — Ruang

### Tujuan

Katalog latihan penanganan ("Latihan") ringan yang bisa dimulai/diselesaikan/
dilewati, dipersonalisasi dari faktor check-in terbaru — peran "Act" dalam
loop produk.

### Screen yang terlibat

Hanya `/ruang`. Latihan yang dijalankan di sini muncul kembali (read-only) di
`/jejak`.

### Cara kerja

Satu kontrol filter menentukan sumber data:

- **Default ("Untuk kamu", `filter = null`)** → `GET /api/actions/recommended`:
  mengambil `factors` dari **5 check-in terakhir**, meranking berdasarkan
  frekuensi, mencari `Action` aktif yang `relatedFactors`-nya beririsan
  dengan faktor teratas (maksimum 6), lalu menambal kekurangannya dengan
  `Action` aktif generik terbaru kalau hasil yang cocok kurang dari 6.
  Endpoint ini juga mengembalikan `basedOnFactors` (daftar faktor yang
  dipakai) yang ditampilkan sebagai teks "Disarankan dari check-in
  terakhirmu: …".
- **Chip tipe** (Refleksi/Napas/Pemulihan/Perencanaan/Belajar/Dukungan) →
  `GET /api/actions?type=X`, katalog biasa terpaginasi, tanpa personalisasi.

Per kartu latihan:

1. "Mulai" → `POST /api/action-logs { actionId }` → membuat `ActionLog`
   berstatus `STARTED`. Tombol berubah jadi "Lewati"/"Selesai".
2. Salah satu ditekan → `PATCH /api/action-logs/{id} { status }` (nilai yang
   diterima hanya `COMPLETED` atau `SKIPPED`). Server mengisi `completedAt`
   **pada kedua kasus** — termasuk saat dilewati, bukan hanya saat selesai.
3. Setelah itu kartu menampilkan catatan status statis ("Sedang
   berjalan."/"Sudah kamu selesaikan."/"Kamu lewati kali ini.") dan tidak ada
   jalan untuk membatalkannya dari UI.

### State & Edge Case

| Situasi | Perilaku saat ini |
| --- | --- |
| Refresh halaman setelah menekan "Mulai" | **TBD/keterbatasan penting** — status "sedang berjalan/selesai/dilewati" **hanya disimpan di state React lokal** (`logs`), bukan diambil ulang dari server. Me-refresh `/ruang` membuat kartu itu kembali menampilkan "Mulai", walau `ActionLog`-nya sendiri tetap tersimpan benar di database dan tetap muncul di `/jejak`. Tidak ada `GET` untuk "apa yang sedang saya jalankan hari ini". |
| Menekan "Mulai" dua kali pada action yang sama sebelum menutupnya | Tidak dicegah di klien — akan membuat dua `ActionLog` `STARTED`; entri lokal (`logs[actionId]`) hanya menyimpan yang terakhir, jadi `ActionLog` pertama jadi "yatim" (tetap ada di database dan di Jejak, tapi tidak lagi bisa ditutup dari kartu Ruang). |
| Katalog `Action` kosong sama sekali | **TBD/operasional** — tidak ada UI admin, tidak ada seed script, dan **tidak ada `POST /api/actions`** di mana pun pada aplikasi ini untuk mengisi katalog. Entri harus dimasukkan langsung ke MongoDB di luar aplikasi. Tanpa data ini, `/ruang` akan kosong permanen untuk semua pengguna. |
| Tidak ada faktor dari check-in terbaru (`topFactors` kosong) | Rekomendasi otomatis jatuh ke daftar generik; teks "Disarankan dari..." disembunyikan karena `basedOnFactors` kosong. |
| `Action.relatedFactors` vs `CheckIn.factors` | `relatedFactors` di skema `Action` adalah `[String]` bebas, **tidak terikat enum** ke 9 nilai `factors` pada `CheckIn`. Kecocokan rekomendasi bergantung penuh pada disiplin data saat mengisi katalog secara manual — salah ketik (`"Academic"` alih-alih `"ACADEMIC"`) akan gagal cocok tanpa ada error validasi apa pun. **TBD.** |
| 401 di titik manapun | `router.replace("/auth/login")`. |

---

## Fitur Pendukung Lintas Halaman

Bukan salah satu dari lima fitur inti, tapi memengaruhi cara kelimanya
dialami:

- **Navbar** (`components/NavbarGlobal.tsx`) — dua varian: `"marketing"`
  (sebelum login) dan `"app"` (setelah login, menampilkan 5 tautan inti +
  badge streak 🔥 yang di-fetch ulang dari `/api/me` di setiap halaman app).
  Item aktif dicocokkan lewat prefix path, jadi `/check-in/[id]` tetap
  menyorot "Check-in".
- **Footer** (`components/FooterGlobal.tsx`) — tampil di semua halaman
  **kecuali** `/onboarding`. Membawa disclaimer *"RuangPijar bukan layanan
  diagnosis atau pengganti bantuan profesional."*
- **Tur onboarding spotlight** (`components/OnboardingTour.tsx` +
  `lib/tour.ts`) — dibangun di atas react-joyride, satu tur per bagian
  (`check-in`, `jejak`, `insight`, `ruang`, `profile`), otomatis tampil
  sekali per bagian (ditandai lewat `localStorage` key
  `ruangpijar:tour-seen:v1`), dan bisa diputar ulang kapan saja dari
  Profil → "Ulangi panduan" (menghapus flag + memicu ulang tur yang sedang
  ter-mount). Anchor memakai atribut `data-tour="..."`; kalau target tidak
  muncul dalam 4 detik (mis. fetch lambat), langkah itu dilewati alih-alih
  tur macet.
- **Splash screen** (hanya di `/`) — logo ditahan 3 detik lalu zoom 0.8 detik
  sebelum landing page terlihat; dilewati sepenuhnya di bawah
  `prefers-reduced-motion: reduce`. Animasi entrance landing page (scroll
  reveal) sengaja ditahan sampai splash ini selesai.
- **Profil** (`/profile`) — dua bagian dengan tombol simpan terpisah: Akun
  (nama + avatar lewat Cloudinary dengan langkah crop menggunakan
  `react-easy-crop`; email selalu read-only karena jadi identitas login) dan
  Preferensi (field yang sama seperti onboarding). Juga tempat "Ulangi
  panduan" dan tombol "Keluar" (sign-out).

---

## Referensi Endpoint API

Dipetakan dari pembacaan langsung tiap `page.tsx`/`route.ts` dan disilangkan
dengan `docs/openapi.json` (21 operasi terdokumentasi, seluruhnya cocok
dengan yang ditemukan di kode — tidak ada endpoint tersembunyi atau usang).

| Halaman | Endpoint yang dipakai |
| --- | --- |
| `/auth/login` | `POST /api/auth/callback/credentials` (via `signIn`), `GET/POST /api/auth/*` (Google OAuth) |
| `/auth/register` | `POST /api/auth/register` |
| `/onboarding` | `GET`, `PATCH /api/personalization` |
| `/check-in` | `POST /api/check-ins` |
| `/check-in/[id]` | `GET`, `DELETE /api/check-ins/[id]` |
| `/check-in/[id]/edit` | `GET`, `PATCH /api/check-ins/[id]` |
| `/jejak` | `GET /api/check-ins` (kalender), `GET /api/jejak` (feed) |
| `/insight` | `GET /api/insights`, `POST /api/insights/generate`, `PATCH /api/insights/[id]` |
| `/insight/[id]` | `GET /api/insights` (ditelusuri manual — lihat catatan di atas), `PATCH /api/insights/[id]` |
| `/ruang` | `GET /api/actions`, `GET /api/actions/recommended`, `POST /api/action-logs`, `PATCH /api/action-logs/[id]` |
| `/profile` | `GET`/`PATCH /api/me`, `GET`/`PATCH /api/personalization`, `POST /api/upload` |
| `NavbarGlobal` (varian app) | `GET /api/me` (untuk badge streak) |
| (eksternal, Vercel Cron) | `GET /api/cron/streak-check` |
| `/docs` | Bukan halaman produk — `route.ts` yang menyajikan Scalar API reference dari `docs/openapi.json` |

Endpoint yang **sengaja tidak ada** (bukan hilang, tapi memang belum
dibangun): `GET /api/insights/{id}`, `GET /api/action-logs` (daftar),
`GET /api/action-logs/{id}`, `POST /api/actions`, apa pun untuk hapus akun
atau ubah password.

---

## Daftar TBD Terkonsolidasi

| # | Area | TBD |
| --- | --- | --- |
| 1 | Auth | Link "Lupa password?" mengarah ke `/forgot-password` yang tidak ada — link mati. |
| 2 | Auth | Tidak ada alur reset/ubah password, hapus akun, atau menambahkan password ke akun yang dibuat lewat Google. |
| 3 | Auth | Tidak ada verifikasi email saat registrasi. |
| 4 | Auth | Tidak ada halaman error kustom untuk kegagalan OAuth (`pages.error` NextAuth tidak dikonfigurasi). |
| 5 | Auth/Model | `User.onboardingCompleted` ada di skema tapi tidak pernah diisi oleh UI mana pun — kemungkinan sisa dari desain awal sebelum `Personalization.onboardingCompleted` dipakai. |
| 6 | Onboarding | Wizard onboarding tidak memeriksa status selesai sebelumnya — pengguna lama tetap melewati 3 langkah (terisi otomatis) di setiap login baru. Perlu diklarifikasi apakah ini perilaku yang diinginkan. |
| 7 | Onboarding/Personalisasi | `Personalization.focusAreas`, `checkInFrequency`, dan `preferredCheckInTime` disimpan tapi **tidak dibaca ulang oleh fitur mana pun** — Insight dan rekomendasi Ruang sama-sama memakai `CheckIn.factors` langsung, bukan data personalisasi ini. Perlu diklarifikasi apakah personalisasi ini memang seharusnya memengaruhi sesuatu. |
| 8 | Check-in | Streak tidak dihitung ulang saat check-in diubah atau dihapus — hanya `POST` yang menyentuh `currentStreak`. |
| 9 | Check-in | Progres wizard check-in (dan onboarding) hilang total kalau halaman di-refresh di tengah jalan — tidak ada draft tersimpan. |
| 10 | Insight | Tipe `REFLECTION` ada di enum/label tapi tidak pernah dihasilkan oleh `lib/insight-generator.ts`. |
| 11 | Insight | Tidak ada deduplikasi — menekan "Cari pola baru" berulang pada data yang sama bisa membuat insight yang isinya nyaris identik berkali-kali. |
| 12 | Insight | Tidak ada `GET /api/insights/{id}` — halaman detail menelusuri daftar secara manual sebagai solusi sementara (didokumentasikan juga di `docs/audit-integrasi.md`). |
| 13 | Ruang | Status "sedang berjalan/selesai/dilewati" pada kartu latihan hanya di state lokal React — hilang saat refresh meski data di database tetap benar. |
| 14 | Ruang | Tidak ada cara mengelola katalog `Action` dari dalam aplikasi (tidak ada admin UI, seed script, atau `POST /api/actions`) — harus diisi manual ke MongoDB. |
| 15 | Ruang | `Action.relatedFactors` adalah string bebas tanpa validasi enum terhadap nilai `CheckIn.factors` — ketidakcocokan penulisan akan gagal senyap tanpa error. |
| 16 | Jejak | Paginasi feed "Latihan & Insight" adalah heuristik (`items.length === limit`), bukan hitungan pasti, karena `/api/jejak` tidak mengembalikan total gabungan. |

---

## Ketidaksesuaian Marketing vs Implementasi

Metadata di `app/layout.tsx` (judul `<head>` situs) menuliskan: *"Ditenagai AI
untuk validasi emosi seketika, diamankan oleh jaringan Web3 untuk privasi
mutlak."* Ini **tidak cocok dengan implementasi**:

- **Tidak ada AI/ML/LLM.** `package.json` tidak memuat SDK AI apa pun.
  Seluruh mesin Insight adalah aritmatika sederhana berbasis aturan (rata-rata,
  korelasi Pearson, hitung frekuensi) — dikonfirmasi eksplisit oleh deskripsi
  endpoint di `docs/openapi.json` sendiri: *"Rule-based analysis (no
  ML/LLM)"*.
- **Tidak ada Web3/blockchain.** Tidak ada dependency terkait di
  `package.json`; penyimpanan data adalah MongoDB (Atlas) biasa lewat
  Mongoose, bukan jaringan terdesentralisasi.

Sebagai perbandingan, salinan di badan landing page (`app/page.tsx`) dan
footer justru **konsisten dengan kode**: *"Tidak ada diagnosis. Tidak ada
label. Hanya data dari pengalamanmu sendiri."* dan *"RuangPijar bukan layanan
diagnosis atau pengganti bantuan profesional."* Hanya metadata `<head>` yang
tampak sebagai salinan lama/aspirasional yang belum diperbarui mengikuti
implementasi aktual.

---

## Variabel Lingkungan

Dari `.env.example` — relevan untuk memahami dependency eksternal tiap fitur:

| Variabel | Dipakai untuk |
| --- | --- |
| `MONGODB_URI` | Koneksi database (`lib/mongodb.ts`) — semua fitur |
| `AUTH_SECRET` | NextAuth JWT signing — wajib di production |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Provider Google OAuth (Auth Flow) |
| `EMAIL_USER`, `EMAIL_PASS` | SMTP Gmail untuk email pengingat/reset streak (`lib/email.ts`, dipakai `/api/cron/streak-check`) |
| `CRON_SECRET` | Mengamankan `/api/cron/streak-check` dari pemanggilan tanpa otorisasi |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Upload avatar profil (`POST /api/upload`) |
