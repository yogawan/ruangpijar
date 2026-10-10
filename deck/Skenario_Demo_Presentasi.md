# Skenario Demo — RuangPijar (MindCraft Web Competition 2026)

> **Catatan gaya naskah.** Ditulis pakai "saya/kita" karena ini di depan juri,
> tapi kalimatnya sengaja dibuat ngobrol — bukan baca teks formal. Kalau
> suasana presentasinya lebih santai dan kalian emang biasa manggil diri
> "gue", tinggal find-replace, strukturnya tetap sama. Sesuaikan juga
> timing per bagian dengan slot demo yang kalian dapat — angka menit di
> bawah cuma estimasi kasar.

---

## 0. Checklist H-1 (WAJIB dicek malam ini, bukan besok pagi)

**⚠️ Yang paling gampang bikin demo gagal:** katalog latihan (`Action`) di
RuangPijar **tidak punya admin UI atau seed script** — isinya harus
dimasukkan manual ke MongoDB. Kalau koleksi `actions` kosong, atau tidak ada
entri aktif yang `relatedFactors`-nya mengandung `ACADEMIC`, tab "Untuk kamu"
di Ruang bakal nampilin latihan generik tanpa label "Disarankan dari
check-in terakhirmu" — hilang momen "wah nyambung"-nya. **Cek ini duluan
sebelum siapin yang lain.**

Checklist lengkap:

- [ ] Pastikan ada minimal 3-4 `Action` aktif di database, dan **minimal satu**
      punya `relatedFactors` berisi `ACADEMIC` (biar nyambung sama skenario
      check-in di bawah)
- [ ] Siapin koneksi internet cadangan (hotspot HP) — aplikasi ini connect
      live ke MongoDB Atlas, bukan data lokal/dummy
- [ ] Hafalin urutan angka check-in di tabel bawah biar pas demo tinggal
      klik, enggak mikir di tempat
- [ ] Putuskan: demo **full live check-in** (isi 3 check-in dari kondisi
      kosong, ±2 menit) atau **hybrid** (login akun yang riwayatnya sudah
      diisi dari H-1, lebih aman kalau slot waktu makin sempit)
- [ ] Pastikan device/browser yang dipakai demo **sudah login ke akun
      Google** yang mau dipakai, idealnya cuma satu akun Google tersimpan di
      situ — biar klik "Lanjutkan dengan Google" langsung tembus tanpa
      muncul account-picker atau keliatan akun pribadi lain
- [ ] Coba dry-run alur Google login ini minimal sekali sebelum tampil,
      soalnya dia redirect ke accounts.google.com dan balik lagi — lebih
      rawan ke masalah jaringan venue dibanding form biasa
- [ ] Pastikan akun demo itu belum punya riwayat check-in sama sekali (atau
      sudah di-reset), biar 3 check-in di langkah 4 tetap kelihatan sebagai
      progres yang baru, bukan numpuk di atas data lama

**Hal teknis yang perlu diingat biar enggak kaget di panggung:**

- Tanggal check-in (`checkedInAt`) otomatis "sekarang" dan **tidak bisa
  diset mundur dari form** — jadi 3 check-in yang didemoin bakal numpuk di
  tanggal yang sama. Ini normal, bukan bug: Insight tetap bisa baca karena
  dia membandingkan *urutan* check-in, bukan harus beda hari kalender.
  Kalender di Jejak nanti nunjukin **1 tanggal dengan badge angka 3**, bukan
  3 tanggal terpisah — siapkan kalimatnya biar ini kelihatan sebagai fitur
  ("bisa check-in lebih dari sekali sehari"), bukan kebingungan.
- Popup perayaan streak **cuma muncul di check-in pertama** hari itu — check-in
  ke-2 dan ke-3 di hari yang sama tidak menaikkan streak lagi, jadi
  popup-nya enggak akan muncul berkali-kali. Jangan panik kalau tidak
  muncul lagi di check-in kedua.

### Data 3 check-in yang disarankan (dihitung biar ketiga insight nyala)

| # | Mood | Energi | Stres | Tidur | Beban Akademik | Faktor | Refleksi |
|---|------|--------|-------|-------|-----------------|--------|----------|
| 1 | Rendah (2) 😞 | 4 | 8 | 4 jam | 9 | Akademik | "Tugas numpuk, begadang ngerjain deadline" |
| 2 | Biasa (3) 😐 | 5 | 6 | 6 jam | 6 | Akademik, Tidur | "Masih capek tapi mending dikit" |
| 3 | Baik (4) 🙂 | 7 | 3 | 8 jam | 4 | Akademik | "Udah mulai kecicil, tidur juga cukup" |

Dengan angka ini:
- **TREND** nyala di mood (naik), stres (turun), dan energi (naik) — selisih
  rata-rata paruh awal vs akhir di atas ambang
- **CORRELATION** nyala kuat — makin sedikit tidur, makin tinggi stres,
  polanya konsisten di ketiga entri
- **PATTERN** nyala — faktor "Akademik" muncul di ketiga check-in
- **Ruang** akan menandai "Akademik" sebagai faktor teratas, jadi rekomendasi
  latihan bisa nyambung ke situ (asalkan katalognya sudah disiapkan sesuai
  checklist di atas)

---

## 1. Opening — Transisi ke Demo (~10 detik)

**Aksi:** buka halaman login RuangPijar langsung — enggak perlu mampir ke
landing page kalau mau lebih cepat.

**Naskah:**
> "Oke, sekarang saya mau tunjukin langsung gimana RuangPijar ini jalan —
> dari pengguna login, sampai dia dapet rekomendasi yang kerasa personal.
> Saya langsung login pakai akun yang sudah saya siapkan, biar enggak
> buang-buang waktu demo buat isi form pendaftaran — tapi alur yang saya
> lewatin ini persis sama kayak yang dialamin pengguna baru."

---

## 2. Login pakai Google (~5 detik)

**Aksi:** buka `/auth/login`, klik **"Lanjutkan dengan Google"**, pilih akun
Google yang sudah disiapkan → otomatis diarahkan ke `/onboarding`.

**Naskah:**
> "Pendaftarannya sendiri gampang kok — bisa isi manual nama, email,
> password, atau malah satu klik pakai akun Google kayak yang saya lakuin
> sekarang. Saya klik 'Lanjutkan dengan Google'... pilih akun... dan
> langsung masuk, enggak perlu ngetik apa-apa lagi.
>
> Oh iya, kalau email Google ini kebetulan sama dengan akun yang pernah
> daftar manual sebelumnya, sistem otomatis nyambungin ke akun yang sama —
> enggak bakal kebuat akun duplikat. Tapi kalau ini email yang bener-bener
> baru, RuangPijar otomatis bikinin akunnya di belakang layar, lengkap sama
> nama dan foto profil yang ke-ambil langsung dari Google saya."

---

## 3. Onboarding (~20 detik)

**Aksi:** setelah login, otomatis diarahkan ke `/onboarding`, isi 3 langkah
singkat.

**Naskah:**
> "Begitu login, saya langsung diajak kenalan sebentar — tiga langkah
> doang. Pertama, saya pilih hal yang pengen saya perhatiin, misalnya mood,
> stres, atau tidur. Terus saya pilih seberapa sering saya mau check-in —
> defaultnya harian. Terakhir, jam berapa saya pengen diingetin.
>
> Ini semua bisa saya ubah lagi kapan aja lewat halaman Profil — dan
> menariknya, langkah kenalan ini bakal selalu muncul tiap kali login baru,
> jadi preferensi pengguna enggak kekunci cuma di hari pertama daftar."

---

## 4. Check-in, 3x berturut-turut (~2 menit)

**Aksi check-in #1 (yang ini didetailin, biar UX wizard-nya kelihatan):**
masuk ke `/check-in`, jalani 5 langkah pakai data baris pertama di tabel.

**Naskah:**
> "Nah ini jantungnya RuangPijar — Check-in. Lima langkah singkat, enggak
> sampai dua menit. Pertama saya pilih mood lewat ekspresi wajah — saya
> pilih 'Rendah' dulu. Lanjut saya atur energi dan stres pakai slider:
> energi 4, stres 8 — lagi berat. Saya isi jam tidur, cuma 4 jam, beban
> akademik saya set tinggi di 9. Berikutnya saya pilih faktor yang paling
> mempengaruhi — saya pilih Akademik. Dan terakhir ada ruang refleksi
> bebas, saya isi dikit: 'Tugas numpuk, begadang ngerjain deadline.' Submit.
>
> Nah kalau ini check-in pertama di hari ini, biasanya muncul popup kecil
> perayaan streak — reward sederhana biar orang termotivasi konsisten."

**Aksi check-in #2 & #3:** ulangi cepat pakai baris 2 dan 3 di tabel, tidak
perlu dijelasin selangkah-selangkah lagi.

**Naskah:**
> "Sekarang saya percepat, saya isi beberapa catatan lagi biar nanti
> Insight-nya punya cukup bahan buat dibaca polanya... saya isi lagi, kali
> ini kondisinya mulai mendingan — mood biasa, stres turun ke 6, tidur 6
> jam. Dan yang terakhir, mood udah baik, stres cuma 3, tidur 8 jam, masih
> sama-sama soal akademik.
>
> Jadi ceritanya di sini ada progres dari yang tadinya berat ke yang mulai
> membaik — ini yang nanti bakal ditangkep sama Insight."

*(Kalau pilih opsi hybrid dari checklist: cukup lakuin check-in #1 live, lalu
bilang "saya sudah punya beberapa catatan dari hari-hari sebelumnya" dan
lanjut ke akun yang riwayatnya sudah diisi dari H-1.)*

---

## 5. Jejak (~30 detik)

**Aksi:** buka `/jejak`, tunjukin kalender (1 tanggal, badge angka 3), klik
tanggalnya untuk buka detail, lalu tunjukin panel feed di sebelahnya.

**Naskah:**
> "Abis check-in, pengguna biasanya mampir ke Jejak — ini semacam buku
> harian visualnya. Di kalender ini, tanggal hari ini ada badge angka 3 —
> itu karena saya check-in tiga kali hari ini. RuangPijar sengaja enggak
> ngebatesin cuma boleh sekali sehari, soalnya kondisi orang kan bisa
> berubah-ubah dalam satu hari.
>
> Kalau saya klik tanggalnya, saya bisa lihat lagi detail semua check-in
> hari ini — mood, statistik, faktor, refleksinya, lengkap.
>
> Di panel sebelah ini nanti bakal keisi begitu saya mulai nyoba latihan di
> Ruang atau nemu pola baru di Insight — jadi Jejak ini titik ketemu dari
> semua fitur lain, bukan halaman yang berdiri sendiri."

---

## 6. Insight (~45 detik — bagian paling penting)

**Aksi:** buka `/insight`, klik **"Cari pola baru"**, tunjukin hasil yang
muncul, buka salah satu detail.

**Naskah:**
> "Sekarang bagian yang paling saya suka jelasin — Insight. Saya klik
> 'Cari pola baru'...
>
> Sistem langsung baca ulang catatan check-in saya dalam 14 hari terakhir
> dan nyari tiga jenis pola: tren naik-turun, keterkaitan antar-angka, dan
> faktor yang paling sering muncul. Dan ini hasilnya langsung keluar —
>
> Dia nangkep tren: mood saya naik, stres saya turun. Dia juga nemu
> keterkaitan antara jam tidur dan stres saya — makin dikit saya tidur,
> makin tinggi stres saya, match banget sama yang saya alamin barusan. Dan
> dia nemu kalau Akademik ini faktor yang paling sering saya catat sebagai
> pemicu.
>
> Yang mau saya tegasin di sini: proses di balik Insight ini **bukan AI
> atau machine learning** — ini murni perhitungan statistik yang
> transparan: rata-rata, korelasi, pola kemunculan faktor. Jadi bukan
> black box, semuanya bisa dijelasin dan dipertanggungjawabkan. Penting
> banget, apalagi ini soal kesehatan mental — kami enggak mau kasih
> kesimpulan yang enggak bisa kami pertanggungjawabkan cara dapetnya."

---

## 7. Ruang (~40 detik)

**Aksi:** buka `/ruang`, tunjukin tab "Untuk kamu" dengan label "Disarankan
dari check-in terakhirmu", klik satu latihan → "Mulai" → "Selesai".

**Naskah:**
> "Terakhir, Ruang — tempat buat nindaklanjutin semua yang tadi ditemukan.
> Begitu saya buka, di tab 'Untuk kamu' sistem udah nyaranin beberapa
> latihan, dan ada keterangannya: 'Disarankan dari check-in terakhirmu' —
> karena Akademik yang paling sering saya catat tadi, latihan yang muncul
> duluan ya yang nyambung ke situ.
>
> Saya klik 'Mulai' di salah satu... dan kalau udah selesai saya tinggal
> klik 'Selesai'. Gampang, enggak ada tekanan — mau dilewatin juga enggak
> masalah, enggak ada penalti buat itu. Catatan latihan ini otomatis nongol
> lagi di Jejak tadi — jadi semuanya nyambung dalam satu siklus: Check-in,
> Jejak, Insight, Ruang, dan balik lagi ke Check-in."

---

## 8. Closing Demo (~15 detik)

**Naskah:**
> "Jadi itu dia keseluruhan perjalanannya — dari kenal pertama kali, sampai
> dapet langkah kecil yang bisa langsung dicoba. Semuanya jalan di atas
> data pengguna itu sendiri — enggak ada diagnosis, enggak ada tebak-tebakan
> AI, semuanya transparan. Dan tetap balik ke prinsip awal kita: kamu tidak
> harus selalu baik-baik aja, tapi sekarang kamu punya ruang buat ngerti
> diri sendiri lebih baik."

---

## 9. Cheat Sheet — Antisipasi Pertanyaan Juri

| Pertanyaan juri | Jawaban singkat yang aman |
|---|---|
| "Insight ini pakai AI?" | Bukan — rule-based statistik transparan (rata-rata, korelasi Pearson, pola faktor), bukan ML/LLM. Boleh disebut "Pattern Recognition Engine" / "Statistical Insight Engine" kalau mau kedengeran meyakinkan, tapi tetap jujur kalau didalami. |
| "Ruang pakai algoritma apa?" | Content-based filtering sederhana — cocokkan faktor dari 5 check-in terakhir ke tag latihan di katalog. |
| "Rekomendasinya di-ranking enggak dari yang paling relevan?" | Jujur: belum, saat ini semua yang match dianggap setara. Itu salah satu arah pengembangan lanjutan yang sudah dipetakan. |
| "Data pengguna aman? Bisa dilihat orang lain?" | Tidak — tiap query selalu difilter berdasarkan user yang login, jadi pengguna cuma bisa lihat datanya sendiri. |
| "Ini pengganti psikolog/konselor?" | Tidak, dan sengaja tidak dirancang untuk itu — murni alat bantu refleksi pribadi, bukan diagnosis. |
| "Insight-nya kok langsung banyak padahal baru 3 kali check-in?" | Karena tiga jenis pola (tren, korelasi, faktor dominan) dievaluasi independen — begitu ambang minimalnya terpenuhi (minimal 3 check-in dalam 14 hari), semuanya bisa nyala bareng. |

---

## 10. Naskah Panjang — Kalau Mau Elaborate Istilah Teknis

Dipakai kalau juri minta dijelasin lebih dalam, bukan cuma jawaban singkat
di cheat sheet atas. Dua-duanya udah dibungkus biar enggak kedengeran kaku
tapi tetep jujur soal cara kerjanya.

### Pattern Recognition Engine (Insight)

> "Jadi gini, kenapa saya sebut ini Pattern Recognition Engine? Soalnya dia
> emang kerjanya nyari pola, bukan sekadar nyimpen data doang. Tapi penting
> saya tegasin — 'pattern recognition' itu bukan berarti AI atau machine
> learning ya, istilah ini sebenernya udah ada jauh sebelum AI booming, dan
> intinya ya nyari keteraturan dari data pakai rumus matematika yang tetap,
> bukan model yang belajar sendiri.
>
> Di balik layar, sistem ini baca ulang riwayat check-in user, terus
> bandingin — misalnya kondisi di separuh awal periode sama separuh akhir,
> kalau bedanya udah lewat ambang tertentu, baru dia bilang 'oh ini ada tren
> naik atau turun nih.' Sama kayak dia ngecek keterkaitan antara jam tidur
> sama stres pakai rumus statistik namanya korelasi Pearson, dan ngecek
> faktor apa yang paling sering disebut user. Jadi semuanya transparan, bisa
> dijelasin satu-satu rumusnya, enggak ada black box, enggak ada
> tebak-tebakan ala AI."

### Frequency-based Factor Matching (Ruang)

> "Kalau yang ini namanya frequency-based factor matching, simpelnya gini —
> sistem itung dulu faktor apa yang paling sering muncul di beberapa
> check-in terakhir user, misalnya ternyata dia sering banget nyebut
> 'akademik' sebagai pemicu. Nah abis ketauan faktor yang paling sering itu,
> baru sistem nyariin latihan-latihan di katalog yang emang udah ditandain
> cocok sama faktor itu.
>
> Jadi bukan ngarang rekomendasi asal-asalan, tapi juga bukan algoritma
> canggih yang belajar sendiri kayak di sistem rekomendasi besar — ini cuma
> itung-itungan frekuensi terus dicocokin ke tag yang udah kita siapin di
> katalog. Simpel, tapi tetep nyambung sama kondisi terbaru user, dan yang
> penting gampang dijelasin kalau ditanya 'kenapa muncul rekomendasi ini?'"
