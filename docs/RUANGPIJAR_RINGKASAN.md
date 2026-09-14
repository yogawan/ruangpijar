# Masalah/Latar Belakang/Tema Lomba

Kesehatan mental (mental well-being) merupakan salah satu aspek penting
dalam kehidupan generasi muda, termasuk mahasiswa. Kehidupan perkuliahan
dapat dihadapkan pada berbagai tuntutan akademik, sosial, maupun pribadi
yang berpotensi memengaruhi kondisi psikologis mahasiswa. Di sisi lain,
mahasiswa juga dapat menghadapi hambatan dalam memperoleh dukungan
kesehatan mental melalui layanan konvensional. Kondisi tersebut
menunjukan pentingnya pengembangan media pendukung yang mudah diakses,
informatif, dan sesuai dengan kebutuhan pengguna.

Perkembangan teknologi digital memberikan peluang dalam menghadirkan
alternatif dukungan kesehatan mental melalui berbagai platform digital,
termasuk website dan aplikasi. Lattie el al. (2019) melalui tinjauan
sistematis terhadap 89 penelitian mengenai intervensi kesehatan mental
digital pada mahasiswa menemukan bahwa 80% intervensi yang teliti
disampaikan melalui website. Hasil kajian tersebut juga menunjukan bahwa
sebagian besar program yang teliti memberikan hasil efektif atau
sebagian efektif dalam meningkatkan kondisi psikologis, termasuk
depresi, kecemasan, dan psychological well-being. Penelitian tersebut
juga menekankan pentingnya aspek usability, penerimaan pengguna, dan
pengalaman pengguna dalam pengembangan intervensi kesehatan mental
digital.

Pemanfaatan teknologi digital juga memiliki potensi untuk membantu
memperluas akses terhadap dukungan kesehatan mental. Naslund et
al. (2017) menjelaskan bahwa teknologi digital dapat dimanfaatkan dalam
upaya pencegahan dan penanganan gangguan mental, terutama dalam kondisi
ketika akses terhadap layanan kesehatan mental masil terbatas. Hal ini
menunjukan bahwa teknologi dapat menjadi salah satu sarana pendukung
untuk menjembatani kebutuhan masyarakat terhadap informasi dan layanan
kesehatan mental.

Dalam konteks tersebut, bidang informatika memiliki peran penting dalam
merancang solusi digital yang tidak hanya berfungsi secara teknis,
tetapi juga memperhatikan kebutuhan dan pengalaman pengguna.
Pengembangan website dengan antarmuka yang mudah digunakan, informasi
yang terstruktur, aksesibilitas yang baik, serta memperlihatkan keamanan
dan privasi dapat menjadi bagian penting dalam menghadirkan solusi
digital yang bertanggung jawab untuk mendukung mental well-being.

Berdasarkan kebutuhan tersebut, Himpunan Mahasiswa Informatika (HMIF)
Universitas Jenderal Ahcmad Yani Yogyakarta menginisiasi MindCraft Web
Competition 2026 dengan tema "Building Digital Solutions, for Mental
Well-being". Kompetisi tingkat Regional Pulau Jawa ini di rancang
sebagai wdah bagi mahasiswa untuk mengembangkan kreativitas, kemampuan
web development, serta perancangan antarmuka dan pengalaman pengguna
(UI/UX) dalam menghasilkan solusi digital yang inovatif dan berorientasi
pada kebutuhan pengguna.

Melalui kegiatan ini, peserta diharapkan mampu menghasilkan website yang
tidak hanya menarik secara visual dan fungsional, tetapi juga memiliki
nilai manfaat, mudah digunakan, inklusif, serta memperhatikan aspek
keamanan, privasi, dan etika. Dengan demikian, MindCraft Web Competition
2026 diharapkan dapat menjadi ruang bagi mahasiswa untuk mengembangkan
kompetensi di bidang Informatika sekaligus mendorong terciptanya inovasi
digital yang dapat memberikan kontribusi positif terhadap mental
well-being masyarakat.

# Solusi: RuangPijar — Gambaran Produk untuk Stakeholder

Berangkat dari latar belakang tersebut, RuangPijar dikembangkan sebagai salah
satu jawaban atas kebutuhan akan media pendukung kesehatan mental yang mudah
diakses, informatif, dan sesuai dengan kebutuhan mahasiswa. Dokumen ini
menjelaskan apa yang bisa dilakukan pengguna di RuangPijar dan bagaimana
pengalamannya, ditulis tanpa istilah teknis. Cocok dibagikan ke siapa saja
yang perlu memahami produk secara garis besar — tanpa perlu latar belakang
IT.

> Untuk tim development yang butuh detail teknis (nama data, cara sistem
> bekerja di baliknya, dan catatan implementasi), lihat `USER_JOURNEY.md`.
> Dokumen ini adalah versi ringkas dan naratifnya.

---

## Apa Itu RuangPijar?

RuangPijar adalah aplikasi web yang membantu seseorang — terutama mahasiswa —
untuk lebih mengenali kondisi dirinya sehari-hari: suasana hati, energi,
tingkat stres, dan hal-hal yang memengaruhinya. Caranya sederhana: catat
sebentar setiap hari, lalu aplikasi membantu menunjukkan pola yang mungkin
tidak disadari, dan menyarankan langkah kecil yang bisa dicoba.

Pesan yang ingin disampaikan produk ini cukup jelas dari halaman utamanya:
**"Kamu tidak harus selalu baik-baik saja."** RuangPijar bukan aplikasi
diagnosis dan bukan pengganti bantuan profesional (psikolog, konselor, dsb).
Ini murni alat bantu refleksi pribadi — semacam jurnal harian yang bisa
"membaca dirinya sendiri".

---

## Satu Siklus, Empat Langkah

Seluruh pengalaman di RuangPijar berputar pada empat langkah yang saling
menyambung:

```
   Catat              Lihat Kembali         Pahami               Coba
 Check-in    ──────►     Jejak      ──────►  Insight    ──────►  Ruang
(ceritakan               (riwayat             (pola yang          (langkah
kondisimu                perjalanan            mulai                kecil
hari ini)                 harian)              terlihat)          untuk dicoba)
    ▲                                                                  │
    └──────────────────────────────────────────────────────────────────┘
                     (langkah kecil ini mendorong check-in berikutnya)
```

Semakin rutin seseorang check-in, semakin banyak bahan yang dimiliki Insight
untuk menemukan pola, dan semakin relevan saran yang muncul di Ruang. Empat
langkah ini yang menjadi tulang punggung seluruh aplikasi.

---

## Perjalanan Pengguna, dari Awal Sampai Terbiasa

### 1. Menemukan RuangPijar dan Mendaftar

Pengunjung baru mendarat di halaman utama, membaca penjelasan singkat tentang
manfaat aplikasi, lalu bisa langsung mendaftar dengan dua cara: mengisi nama,
email, dan password sendiri, **atau** cukup satu klik lewat akun Google.
Kalau memilih daftar manual, pengguna diminta login lagi setelah
pendaftaran berhasil (bukan langsung masuk otomatis).

Orang yang sudah punya akun tinggal login dengan email/password yang sama
atau akun Google yang sama. Kalau sebelumnya pernah daftar pakai email lalu
suatu saat login pakai Google dengan email yang sama, sistem akan mengenali
itu sebagai akun yang sama (tidak membuat akun ganda).

*Yang belum tersedia:* tombol "Lupa Password" ada di halaman login, tapi
belum terhubung ke proses apa pun — untuk saat ini belum ada cara mandiri
bagi pengguna untuk reset password sendiri kalau lupa. Begitu juga belum ada
menu untuk menghapus akun atau mengganti email.

### 2. Kenalan Singkat (Onboarding)

Setiap berhasil masuk, pengguna disambut dengan tiga pertanyaan singkat
sebelum mulai memakai aplikasi:

- Hal apa yang paling ingin diperhatikan (mood, stres, energi, tidur,
  akademik, sosial, relasi, atau diri sendiri — boleh pilih lebih dari satu
  atau dilewati semua),
- Seberapa sering ingin check-in (tiap hari, atau beberapa kali seminggu),
- Jam berapa yang paling nyaman untuk diingatkan.

Jawaban ini bisa diubah lagi kapan saja lewat halaman Profil.

*Catatan penting:* pertanyaan ini muncul lagi setiap kali pengguna login
(jawaban lama otomatis terisi, jadi tidak perlu diisi dari nol), bukan hanya
sekali di awal saja. Ini bisa terasa repetitif bagi pengguna lama — perlu
dipertimbangkan apakah ini pengalaman yang diinginkan.

### 3. Check-in — Mencatat Kondisi Harian

Ini jantung dari seluruh aplikasi. Prosesnya dirancang singkat, sekitar dua
menit, terbagi jadi lima pertanyaan santai:

1. Bagaimana perasaan hari ini (dipilih lewat lima pilihan wajah/emoji),
2. Seberapa penuh energi dan seberapa berat stres (digeser di skala 1–10),
3. Berapa jam tidur semalam, seberapa berat beban akademik dan sosial
   (boleh dilewati kalau tidak ingin diisi),
4. Hal apa yang terasa memengaruhi hari ini (akademik, pekerjaan, sosial,
   keluarga, keuangan, tidur, relasi, diri sendiri, atau lainnya — boleh
   pilih lebih dari satu atau tidak sama sekali),
5. Ruang cerita bebas kalau ingin menuliskan sesuatu.

Tidak ada jawaban yang salah, dan sebagian besar pertanyaan boleh dilewati.
Setelah tersimpan, kalau pengguna sudah check-in beberapa hari berturut-turut
tanpa putus, akan muncul perayaan kecil di layar sebagai bentuk apresiasi atas
konsistensinya ("streak"). Kalau lupa check-in, sistem akan mengirim email
pengingat secara otomatis sebelum "rangkaian harinya" hilang — dan kalau
tetap tidak check-in selama tiga hari berturut-turut, rangkaiannya dianggap
putus dan mulai dari awal lagi di check-in berikutnya.

Setiap catatan yang sudah tersimpan bisa dilihat lagi, diubah kalau ada yang
salah ketik, atau dihapus kalau memang tidak ingin disimpan.

*Catatan penting:* mengubah atau menghapus catatan lama tidak memengaruhi
angka "rangkaian hari berturut-turut" yang sudah kadung tercatat — angka itu
hanya diperbarui saat ada check-in baru, bukan dihitung ulang dari riwayat.

### 4. Jejak — Melihat Kembali Perjalanan

Halaman ini adalah "buku harian" RuangPijar. Ada dua bagian:

- **Kalender bulanan** — setiap tanggal yang sudah diisi check-in ditandai
  dengan wajah suasana hati hari itu. Klik tanggalnya untuk membaca lagi apa
  yang dicatat hari itu, termasuk kalau dalam satu hari ada lebih dari satu
  check-in.
- **Daftar aktivitas** — latihan yang pernah dicoba dari halaman Ruang, dan
  pola-pola yang pernah ditemukan Insight, disusun dari yang terbaru,
  supaya kelihatan sebagai satu rangkaian perjalanan, bukan tercecer di
  halaman yang berbeda-beda.

Kalau bulan yang dilihat belum ada catatan sama sekali, atau memang belum
pernah mencoba latihan apa pun, halaman ini akan mengajak pengguna untuk
mulai — bukan dibiarkan kosong tanpa arahan.

### 5. Insight — Menemukan Pola dari Catatan Sendiri

Setelah cukup banyak catatan terkumpul (minimal beberapa hari check-in dalam
dua minggu terakhir), pengguna bisa menekan tombol **"Cari pola baru"** untuk
meminta sistem membaca ulang catatannya dan mencari hal yang mungkin belum
disadari. Contoh pola yang bisa muncul:

- *"Tren mood kamu menurun dalam dua minggu terakhir."*
- *"Tidur berkaitan dengan tingkat stres kamu"* — semakin sedikit tidur,
  semakin tinggi kecenderungan stresnya (atau sebaliknya).
- *"Beban akademik sering muncul sebagai faktor yang memengaruhi"* — kalau
  satu hal disebut berulang kali sebagai faktor di banyak check-in.

Setiap pola yang ditemukan juga menyertakan seberapa yakin sistem terhadap
pola tersebut (ditampilkan sebagai persentase), supaya pengguna tahu ini
bukan kepastian mutlak, melainkan kecenderungan dari datanya sendiri. Pola
yang sudah dibaca bisa ditandai "sudah dibaca" supaya daftarnya tetap rapi.

**Hal paling penting untuk dipahami:** insight **tidak muncul otomatis**.
Pengguna harus aktif menekan tombolnya sendiri setiap kali ingin dicek ulang.
Kalau datanya masih terlalu sedikit, sistem akan bilang jujur "belum cukup
data" alih-alih memaksakan sebuah pola.

Satu hal lagi yang perlu digarisbawahi terutama untuk materi pemasaran:
**pencarian pola ini murni perhitungan statistik sederhana** (rata-rata,
tren, dan keterkaitan angka) dari data yang diisi pengguna sendiri — **bukan
kecerdasan buatan (AI)**. Ini penting supaya klaim yang disampaikan ke
pengguna atau publik tetap akurat dengan apa yang sebenarnya terjadi di
balik layar.

### 6. Ruang — Mengambil Langkah Kecil

Berdasarkan hal-hal yang paling sering disebut sebagai faktor di catatan
terbaru, halaman ini menyarankan beberapa latihan singkat yang relevan —
misalnya latihan pernapasan, jurnal refleksi singkat, tips memulihkan
energi, cara menyusun ulang prioritas tugas, materi edukasi ringan, atau
arahan mencari dukungan. Pengguna juga bisa menelusuri latihan lain di luar
rekomendasi, dikelompokkan per kategori.

Alurnya sengaja dibuat tanpa tekanan: tekan **"Mulai"** untuk mencoba satu
latihan, lalu tandai **"Selesai"** kalau sudah dijalankan, atau
**"Lewati"** kalau ternyata belum cocok — keduanya sama-sama dianggap wajar,
tidak ada penalti.

*Catatan penting untuk tim:* saat ini **daftar latihan yang muncul di Ruang
harus disiapkan dan dikelola langsung oleh tim di balik layar** — belum ada
halaman di dalam aplikasi untuk menambah, mengubah, atau menonaktifkan
latihan sendiri. Kalau daftar ini kosong, halaman Ruang juga akan tampak
kosong bagi semua pengguna. Ini perlu jadi perhatian operasional, bukan
sekadar isu teknis.

---

## Fitur Pendukung Lainnya

- **Panduan singkat di setiap halaman** — pengguna baru mendapat semacam tur
  singkat bergambar saat pertama kali membuka tiap bagian aplikasi, supaya
  tidak bingung harus mulai dari mana. Panduan ini bisa diputar ulang kapan
  saja lewat halaman Profil, kalau pengguna ingin diingatkan lagi.
- **Halaman Profil** — tempat mengubah nama, foto profil, preferensi yang
  diisi saat kenalan singkat di awal, dan tombol untuk keluar dari akun.
- **Pengingat otomatis lewat email** — berjalan sendiri setiap hari tanpa
  perlu ada yang memicu secara manual, khusus untuk mengingatkan pengguna
  yang rangkaian check-in-nya mulai terancam putus.

---

## Hal-Hal yang Perlu Didiskusikan atau Diperhatikan

Beberapa bagian aplikasi sudah berjalan tapi manfaatnya belum sepenuhnya
tersambung ke pengalaman pengguna. Ini bukan soal salah-benar secara teknis,
tapi lebih ke keputusan produk yang perlu didiskusikan tim:

1. **Jawaban "kenalan singkat" di awal (minat, frekuensi, jam favorit) belum
   memengaruhi apa pun.** Saat ini rekomendasi di Ruang dan pola di Insight
   sama sekali tidak melihat jawaban ini — keduanya hanya melihat catatan
   check-in harian. Perlu diputuskan: apakah jawaban ini memang seharusnya
   dipakai untuk mempersonalisasi pengalaman, atau memang cukup sebagai
   data pelengkap saja untuk saat ini.
2. **Reset password belum ada.** Tombol "Lupa Password" sudah tampil di
   layar tapi belum berfungsi. Kalau ada pengguna nyata yang lupa password,
   saat ini tidak ada jalan keluar mandiri untuknya.
3. **Insight tidak proaktif.** Karena harus dipicu manual oleh pengguna,
   ada kemungkinan sebagian pengguna tidak pernah tahu fitur ini ada atau
   tidak pernah menekannya. Kalau tujuannya supaya pengguna rutin
   mendapatkan pola tanpa harus mengingat untuk mengeceknya sendiri, ini
   perlu pengembangan lebih lanjut (misalnya lewat notifikasi berkala).
4. **Daftar latihan di Ruang butuh pengelolaan manual di belakang layar**
   (lihat catatan di bagian Ruang di atas) — ini kebutuhan operasional yang
   berkelanjutan, bukan sekali kerjakan lalu selesai.
5. **Status latihan yang "sedang dijalankan" bisa terlihat hilang kalau
   halaman dimuat ulang** (walau catatan aslinya tetap tersimpan dan tetap
   muncul di halaman Jejak) — ini bisa membingungkan pengguna yang membuka
   ulang halaman Ruang di tengah mengerjakan sebuah latihan.
6. **Belum ada verifikasi email** saat mendaftar, dan belum ada cara bagi
   pengguna menghapus akunnya sendiri.
7. **Tidak menggunakan AI atau teknologi Web3/blockchain apa pun**, meskipun
   ada salinan teks lama di bagian teknis situs yang masih menyebutkan hal
   ini. Perlu dipastikan tidak ada materi promosi yang ikut mengklaim hal
   yang sama, supaya ekspektasi pengguna sesuai dengan yang sebenarnya
   dialami.

---

## Pertanyaan yang Mungkin Muncul

**Apakah data pengguna dilihat orang lain?**
Tidak. Setiap pengguna hanya bisa melihat catatan miliknya sendiri lewat
akunnya masing-masing.

**Apakah RuangPijar bisa mendiagnosis kondisi mental seseorang?**
Tidak, dan memang sengaja tidak dirancang untuk itu. Baik salinan di halaman
utama maupun bagian bawah setiap halaman menyebutkan eksplisit bahwa ini
bukan layanan diagnosis atau pengganti bantuan profesional — sifatnya
refleksi dan dukungan keseharian saja.

**Kalau pengguna tidak pernah membuka aplikasi lagi, apa yang terjadi?**
Tidak ada tindakan otomatis selain email pengingat di beberapa hari pertama
setelah berhenti check-in. Setelah tiga hari tanpa check-in, sistem berhenti
mengingatkan untuk rangkaian itu dan datanya tetap tersimpan seperti biasa
sampai pengguna kembali.

**Berapa lama waktu yang dibutuhkan pengguna baru untuk mulai "kelihatan
hasilnya" (Insight)?**
Butuh setidaknya beberapa hari check-in (idealnya tersebar dalam dua minggu
pertama) sebelum ada cukup data untuk sistem menemukan pola apa pun.
Sebelum itu, menekan "Cari pola baru" akan selalu menjawab bahwa datanya
masih belum cukup.

---

*Dokumen ini adalah versi ringkas dan non-teknis. Untuk detail cara kerja di
balik layar, batasan implementasi, dan referensi lengkap tiap bagian sistem,
lihat `USER_JOURNEY.md` di folder yang sama.*
