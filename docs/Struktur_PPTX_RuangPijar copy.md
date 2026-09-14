@import "tailwindcss";

/* Semantic design tokens. Components reference these through Tailwind
   utilities (bg-surface, text-text-muted, ...) instead of raw colors. */
:root {
  --background: #faf8f4;
  --surface: #ffffff;
  --surface-muted: #eee5ec;
  --peach-subtle: #f8e7df;
  --sage: #8fa58d;
  --sage-soft: #e7efe5;
  --text-main: #292525;
  --text-muted: #746e6a;
  --primary: #5b3a52;
  --primary-hover: #432b3d;
  --accent: #e9a68d;
  --primary-contrast: #ffffff;
  --ai-accent: #6d28d9;
  --border-glass: #e8e2dc;
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-peach-subtle: var(--peach-subtle);
  --color-sage: var(--sage);
  --color-sage-soft: var(--sage-soft);
  --color-text-main: var(--text-main);
  --color-text-muted: var(--text-muted);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-contrast);
  --color-brand: var(--primary);
  --color-brand-hover: var(--primary-hover);
  --color-brand-subtle: var(--surface-muted);
  --color-accent: var(--accent);
  --color-primary-contrast: var(--primary-contrast);
  --color-ai-accent: var(--ai-accent);
  --color-border-glass: var(--border-glass);
  --color-border: var(--border-glass);
  --color-foreground: var(--text-main);
  --color-muted-foreground: var(--text-muted);
  --color-muted: var(--surface-muted);
  --color-card: var(--surface);

  --font-display: var(--font-sora);
  --font-sans: var(--font-plus-jakarta-sans);
  --font-mono: var(--font-jetbrains-mono);
}

/* Ambient glows. `scale` is animated as its own property so it does not
   clobber the translate utilities positioning each blob. */
@theme {
  --animate-glow-primary: glow-primary 12s ease-in-out infinite;
  --animate-glow-accent: glow-accent 14s ease-in-out infinite;

  @keyframes glow-primary {
    0%,
    100% {
      opacity: 0.24;
      scale: 1;
    }
    50% {
      opacity: 0.36;
      scale: 1.08;
    }
  }

  @keyframes glow-accent {
    0%,
    100% {
      opacity: 0.26;
      scale: 1.05;
    }
    50% {
      opacity: 0.36;
      scale: 0.96;
    }
  }
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--text-main);
}

/* Scroll-reveal resting states. `components/ScrollAnimations.tsx` animates
   these open; they start hidden here rather than in JS so nothing flashes
   between first paint and hydration. The <noscript> block in app/layout.tsx
   restores them when JS never runs. */
[data-hero-item],
[data-hero-visual],
[data-reveal],
[data-reveal-stagger] > *,
[data-count] {
  opacity: 0;
}

[data-header] {
  transition:
    box-shadow 0.3s ease,
    backdrop-filter 0.3s ease;
}

[data-header] nav {
  transition: height 0.3s ease;
}

[data-header].is-scrolled {
  box-shadow: 0 1px 16px rgb(41 37 37 / 8%);
  backdrop-filter: blur(10px);
}

/* Outranks Tailwind's `h-20` on specificity alone, so no !important needed. */
[data-header].is-scrolled nav {
  height: 4rem;
}

:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  /* biome-ignore-start lint/complexity/noImportantStyles: must outrank Tailwind's duration/animate utilities so reduced-motion is honored everywhere, including future components. */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Reveal targets are hidden by default for the GSAP entrance. Without this
     they would stay invisible, since that branch never runs here. */
  [data-hero-item],
  [data-hero-visual],
  [data-reveal],
  [data-reveal-stagger] > *,
  [data-count] {
    opacity: 1 !important;
  }
  /* biome-ignore-end lint/complexity/noImportantStyles: end of reduced-motion reset. */
}


# Struktur Presentasi — RuangPijar (MindCraft Web Competition 2026)

Blueprint level-struktur (bukan copywriting final) untuk deck RuangPijar,
mengikuti format lima tahap dari `Struktur_PPTX_Juara_1_Example.md`. Seluruh
konten di bawah ditarik dari `docs/RUANGPIJAR_RINGKASAN.md` — tidak ada fakta,
angka, atau klaim yang ditambahkan di luar dokumen itu. Jumlah slide **tidak
baku**: tambah, gabung, atau pecah slide sesuai kebutuhan storytelling saat
naskah final ditulis.

> **Guardrail klaim (berlaku di semua slide):** Insight adalah perhitungan
> statistik sederhana (rata-rata, tren, keterkaitan angka) dari data check-in
> pengguna sendiri — **bukan AI/kecerdasan buatan**. Produk juga tidak
> memakai Web3/blockchain. Jangan menulis salinan yang menyiratkan
> sebaliknya, walau untuk efek dramatis di panggung.

---

## Tahap 1: Pendahuluan & Urgensi
### The Hook

**Sumber utama:** RUANGPIJAR_RINGKASAN.md — "Masalah/Latar Belakang/Tema Lomba"

**Slide 1 — Cover**
- Nama produk: RuangPijar
- Tagline: "Kamu tidak harus selalu baik-baik saja"
- Event: MindCraft Web Competition 2026 — "Building Digital Solutions, for Mental Well-being"
- `[Nama tim & anggota]`

**Slide 2 — Latar Belakang: Beban yang Sering Tidak Disadari**
- Kesehatan mental adalah aspek penting kehidupan mahasiswa, dihadapkan tuntutan akademik, sosial, dan pribadi yang saling menumpuk
- Mahasiswa menghadapi hambatan mengakses dukungan kesehatan mental lewat layanan konvensional
- Yang dibutuhkan: media pendukung yang mudah diakses, informatif, dan sesuai kebutuhan pengguna — bukan sekadar layanan tambahan

**Slide 3 — Bukti dari Riset: Peluang Solusi Digital**
- Lattie dkk. (2019) — tinjauan sistematis 89 penelitian: 80% intervensi kesehatan mental digital pada mahasiswa disampaikan lewat website, sebagian besar efektif/sebagian efektif untuk depresi, kecemasan, dan psychological well-being
- Faktor penentu efektivitas: usability, penerimaan pengguna, pengalaman pengguna — bukan cuma daftar fitur
- Naslund dkk. (2017) — teknologi digital menjembatani akses saat layanan kesehatan mental konvensional masih terbatas
- Bidang informatika berperan merancang solusi yang bukan cuma jalan secara teknis, tapi juga memperhatikan kebutuhan, pengalaman, keamanan, dan privasi pengguna

---

## Tahap 2: Solusi
### The Solution

**Sumber utama:** RUANGPIJAR_RINGKASAN.md — "Solusi: Gambaran Produk", "Apa Itu RuangPijar?", "Satu Siklus, Empat Langkah"

**Slide 4 — Pengenalan RuangPijar**
- Elevator pitch: aplikasi web yang membantu seseorang — terutama mahasiswa — lebih mengenali kondisi dirinya sehari-hari (suasana hati, energi, stres, dan hal yang memengaruhinya)
- Cara kerja singkat: catat sebentar tiap hari → aplikasi menunjukkan pola yang mungkin tidak disadari → menyarankan langkah kecil untuk dicoba
- Positioning yang dijaga ketat: **bukan** aplikasi diagnosis, **bukan** pengganti bantuan profesional (psikolog/konselor) — murni alat bantu refleksi pribadi
- Pesan utama dari halaman utama: **"Kamu tidak harus selalu baik-baik saja."**

**Slide 5 — Satu Siklus, Empat Langkah**
- Diagram siklus: **Check-in** (catat kondisi hari ini) → **Jejak** (lihat kembali riwayat) → **Insight** (pahami pola yang mulai terlihat) → **Ruang** (coba langkah kecil) → mendorong check-in berikutnya
- Semakin rutin check-in, semakin banyak bahan buat Insight menemukan pola, semakin relevan saran yang muncul di Ruang
- Kerangka ini menaungi seluruh slide showcase produk berikutnya — tegaskan bahwa keempat halaman bukan fitur lepas-lepas

---

## Tahap 3: Showcase Produk
### The Product

**Sumber utama:** RUANGPIJAR_RINGKASAN.md — "Perjalanan Pengguna, dari Awal Sampai Terbiasa", "Fitur Pendukung Lainnya"

**Slide 6 — Mulai Menggunakan: Daftar & Kenalan Singkat**
- Dua cara daftar: form manual (nama/email/password) atau satu klik akun Google
- Akun dengan email yang sama otomatis dikenali sebagai satu akun, walau pernah pakai dua metode login berbeda (tidak membuat akun ganda)
- Setelah masuk, disambut 3 pertanyaan kenalan singkat: fokus yang ingin diperhatikan (mood/stres/energi/tidur/akademik/sosial/relasi/diri sendiri), frekuensi check-in yang diinginkan, jam pengingat favorit
- Jawaban ini bisa diubah kapan saja lewat halaman Profil

**Slide 7 — Check-in: Mencatat Kondisi Harian**
- Jantung aplikasi — sekitar 2 menit, 5 pertanyaan santai
- Mood lewat 5 pilihan wajah, energi & stres di skala 1–10, jam tidur & beban akademik/sosial (opsional), faktor yang memengaruhi (multi-pilihan), ruang cerita bebas
- Tidak ada jawaban salah, sebagian besar boleh dilewati
- Streak harian sebagai apresiasi konsistensi; email pengingat otomatis dikirim sebelum streak hangus

**Slide 8 — Jejak: Melihat Kembali Perjalanan**
- Kalender bulanan — tiap tanggal yang terisi ditandai ekspresi mood hari itu, bisa diklik untuk membaca ulang
- Daftar aktivitas: latihan yang pernah dicoba di Ruang + pola yang ditemukan Insight, disusun terbaru dulu jadi satu rangkaian perjalanan
- Bulan yang masih kosong diarahkan untuk mulai, bukan dibiarkan kosong tanpa arahan

**Slide 9 — Insight: Menemukan Pola dari Catatan Sendiri**
- Dipicu manual lewat tombol "Cari pola baru", setelah data cukup (beberapa hari check-in dalam 2 minggu terakhir)
- Contoh pola: tren mood menurun, keterkaitan tidur–stres, faktor yang berulang muncul sebagai pemicu
- Tiap pola disertai tingkat keyakinan (persentase) — bukan kepastian mutlak; kalau data kurang, sistem bilang jujur "belum cukup data"
- Guardrail: murni statistik dari data pengguna sendiri — **bukan AI** (lihat catatan di atas)

**Slide 10 — Ruang: Mengambil Langkah Kecil**
- Menyarankan latihan singkat berdasarkan faktor yang paling sering disebut di catatan terbaru (napas, jurnal refleksi, pemulihan energi, menyusun ulang prioritas, edukasi ringan, arahan dukungan)
- Pengguna juga bisa menelusuri latihan lain di luar rekomendasi, per kategori
- Alur tanpa tekanan: **Mulai** → **Selesai** atau **Lewati** — keduanya dianggap wajar, tidak ada penalti

**Slide 11 — Satu Perjalanan yang Menutup Sendiri**
- Rangkai ulang keempat halaman sebagai satu lingkaran: Check-in → Jejak → Insight → Ruang → mendorong check-in berikutnya
- Pesan kunci: ini bukan 4 fitur berdiri sendiri, tapi satu siklus yang saling menghidupkan

**Slide 12 — Fitur Pendukung**
- Panduan singkat bergambar di tiap halaman untuk pengguna baru, bisa diputar ulang kapan saja dari Profil
- Halaman Profil: ubah nama, foto, preferensi onboarding, dan keluar akun
- Pengingat otomatis lewat email, berjalan sendiri tiap hari untuk pengguna yang rangkaian check-in-nya mulai terancam putus

---

## Tahap 4: Dapur Pacu & Proses
### The "How It Works"

**Sumber utama:** *di luar cakupan RUANGPIJAR_RINGKASAN.md (dokumen itu sengaja ditulis non-teknis) — tarik dari `USER_JOURNEY.md` saat menulis naskah final slide ini*

**Slide 13 — Arsitektur Teknologi** `[PLACEHOLDER]`
- `[DESKRIPSI STACK: frontend, BFF/API, database, autentikasi]`
- `[ALUR KOMUNIKASI ANTAR-KOMPONEN]`

**Slide 14 — Cara Kerja Insight (Teknis)** `[PLACEHOLDER]`
- `[RUMUS/AMBANG STATISTIK YANG DIPAKAI UNTUK MENANDAI TREN & KETERKAITAN]`
- `[ALUR INPUT → PROSES → OUTPUT DI BALIK TOMBOL "CARI POLA BARU"]`

---

## Tahap 5: Visi, Eksekusi & Penutup
### The Climax

**Sumber utama:** RUANGPIJAR_RINGKASAN.md — "Hal-Hal yang Perlu Didiskusikan", "Pertanyaan yang Mungkin Muncul"

**Slide 15 — Arah Pengembangan Lanjutan**
- Personalisasi lebih dalam: menghubungkan jawaban kenalan singkat (minat, frekuensi) ke rekomendasi Ruang dan pola Insight — saat ini keduanya hanya melihat catatan check-in harian
- Kemandirian akun: reset password mandiri, verifikasi email, opsi hapus akun sendiri
- Insight yang lebih proaktif: dorongan berkala, bukan menunggu pengguna menekan tombolnya sendiri
- Disusun sebagai roadmap ke depan, bukan daftar kekurangan — sisanya (pengelolaan manual daftar latihan, status latihan yang bisa terlihat reset saat halaman dimuat ulang) adalah catatan operasional internal tim, tidak diangkat ke pitch (lihat RUANGPIJAR_RINGKASAN.md untuk detailnya)

**Slide 16 — Nilai & Batasan yang Dijaga Sengaja**
- Disclaimer konsisten di halaman utama & footer: bukan diagnosis, bukan pengganti bantuan profesional
- Privasi: tiap pengguna hanya bisa melihat catatan miliknya sendiri
- Insight = statistik transparan dari data sendiri, bukan black-box AI (tegaskan lagi di sini)
- Tidak memakai AI atau Web3/blockchain — pastikan tidak ada salinan lama di materi promosi yang masih mengklaim sebaliknya

**Slide 17 — Call to Action / Live Demo**
- Ajak juri mencoba langsung: `[URL DEMO]`, `[QR CODE]`
- Alur singkat yang disarankan: Daftar → Kenalan singkat → Check-in → Jejak → "Cari pola baru" → Ruang
- `[AKUN DEMO dengan riwayat check-in siap pakai, bila disediakan]`

**Slide 18 — Closing**
- Kembali ke pesan inti: **"Kamu tidak harus selalu baik-baik saja."**
- Kaitkan lagi ke latar belakang: kontribusi nyata mahasiswa Informatika terhadap mental well-being, selaras dengan tema MindCraft Web Competition 2026
- Ucapan terima kasih

---

## Materi Cadangan (opsional, di luar hitungan slide utama)

**Sumber utama:** RUANGPIJAR_RINGKASAN.md — "Pertanyaan yang Mungkin Muncul"

Disiapkan untuk sesi tanya jawab juri, bukan untuk ditampilkan di alur utama:
- Apakah data pengguna dilihat orang lain? → Tidak, tiap pengguna hanya bisa melihat catatannya sendiri
- Apakah RuangPijar bisa mendiagnosis kondisi mental seseorang? → Tidak, dan memang sengaja tidak dirancang untuk itu
- Kalau pengguna tidak pernah membuka aplikasi lagi, apa yang terjadi? → Email pengingat di beberapa hari pertama, berhenti mengingatkan setelah 3 hari, data tetap tersimpan sampai pengguna kembali
- Berapa lama sampai Insight "kelihatan hasilnya"? → Perlu setidaknya beberapa hari check-in, idealnya tersebar dalam dua minggu pertama
