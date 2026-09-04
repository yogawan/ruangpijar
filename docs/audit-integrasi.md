# Audit Integrasi Frontend ↔ API

Tanggal: 4 September 2026
Cakupan: seluruh `page.tsx` di `app/` terhadap seluruh route handler di `app/api/`.

> **Pembaruan (putaran cleanup).** Dua endpoint yang semula dicatat menganggur di
> bagian 4 sekarang sudah terpakai, dan satu bug laten di `GET /api/jejak`
> ditemukan saat mengintegrasikannya. Rinciannya di bagian 7.

---

## 1. Ringkasan

| | Jumlah |
| --- | --- |
| Halaman ditinjau | 12 |
| Sudah terintegrasi sebelum audit | 9 |
| Tidak butuh API (statis) | 1 |
| **Belum terintegrasi → diperbaiki** | **1** |
| Endpoint tersedia | 18 (method) |
| Endpoint terpakai setelah cleanup | **18** |
| Endpoint masih menganggur | **0** |

Hasil akhir: `bun run lint`, `tsc --noEmit`, dan `next build` semuanya lolos tanpa
perlu memindahkan file apa pun — sebelumnya `next build` gagal.

---

## 2. Status per halaman

| Halaman | Endpoint yang dipakai | Status |
| --- | --- | --- |
| `app/page.tsx` | — | Statis, tidak butuh API |
| `app/auth/login` | `POST /api/auth/callback/credentials`, `signIn` Google | Terintegrasi |
| `app/auth/register` | `POST /api/auth/register` | Terintegrasi |
| `app/onboarding` | `GET`/`PATCH /api/personalization` | Terintegrasi |
| `app/check-in` | `POST /api/check-ins` | Terintegrasi |
| `app/check-in/[id]` | `GET`/`DELETE /api/check-ins/[id]` | Terintegrasi |
| `app/check-in/[id]/edit` | `GET`/`PATCH /api/check-ins/[id]` | **Baru di cleanup** |
| `app/jejak` | `GET /api/jejak` | **Dipindah di cleanup** (semula `GET /api/check-ins`) |
| `app/insight` | `GET /api/insights`, `POST /api/insights/generate`, `PATCH /api/insights/[id]` | Terintegrasi |
| `app/insight/[id]` | `GET /api/insights`, `PATCH /api/insights/[id]` | **Diperbaiki di audit ini** |
| `app/profile` | `GET`/`PATCH /api/me`, `GET`/`PATCH /api/personalization`, `signOut` | Terintegrasi |
| `app/ruang` | `GET /api/actions`, `GET /api/actions/recommended`, `POST /api/action-logs`, `PATCH /api/action-logs/[id]` | Terintegrasi |

`app/docs` bukan halaman melainkan `route.ts` (Scalar API reference), jadi di luar
cakupan audit halaman.

---

## 3. Temuan dan perbaikan

### 3.1 `app/insight/[id]/page.tsx` kosong dan memblokir build

**Temuan.** File ada tapi berukuran 0 byte. Next.js mewajibkan setiap `page.tsx`
mengekspor komponen default, sehingga `next build` gagal:

```
.next/types/validator.ts: error TS2306:
File 'app/insight/[id]/page.tsx' is not a module.
```

Yang menyesatkan: `bun run lint` dan `tsc --noEmit` **tetap lolos**, karena
validator route baru di-generate saat build. Jadi kegagalan ini tidak terlihat
di pemeriksaan biasa.

**Perbaikan.** Halaman detail insight diimplementasikan dengan endpoint yang ada:
membaca daftar untuk menemukan insight, lalu `PATCH /api/insights/[id]` untuk
menandai baca. Ditambahkan pula tautan "Lihat detail" di kartu daftar supaya
route-nya bisa dijangkau.

**Keterbatasan yang perlu diketahui.** Tidak ada `GET /api/insights/[id]` — yang
tersedia hanya `PATCH`. Karena aturan audit melarang membuat API baru, halaman
detail menelusuri `GET /api/insights?limit=100` sampai id-nya ketemu, lalu
berhenti. Untuk riwayat yang wajar ini satu request saja, dan penelusurannya
dibatasi `totalPages` sehingga tidak ada insight yang luput betapapun banyaknya.
Tetap saja ini solusi kompromi: menambahkan `GET /api/insights/[id]` akan
menghapus seluruh penelusuran ini.

---

## 4. Endpoint yang menganggur (saat audit awal)

Saat putaran audit pertama keduanya sengaja tidak dipaksakan terpakai. Keduanya
sudah **diselesaikan** di putaran cleanup — lihat bagian 7.

### 4.1 `GET /api/jejak`

Timeline gabungan: check-in + action log + insight dalam satu urutan kronologis.

Halaman `app/jejak` justru memakai `GET /api/check-ins`, karena itulah yang
diminta secara eksplisit saat halaman tersebut dikerjakan. Akibatnya halaman
Jejak hanya menampilkan check-in, padahal action log dari Ruang juga tercatat
dan sudah terbukti muncul di `/api/jejak`.

### 4.2 `PATCH /api/check-ins/[id]`

Mengubah check-in yang sudah tersimpan. Halaman `app/check-in/[id]` semula hanya
menyediakan lihat dan hapus.

---

## 5. Hal lain yang ditemukan (di luar cakupan, tidak diubah)

### 5.1 Lima nama class Tailwind tidak menghasilkan CSS

`border-border`, `text-muted-foreground`, `text-foreground`,
`text-primary-foreground`, dan `bg-muted` dipakai di seluruh halaman, tetapi
tidak satu pun terdefinisi di `app/globals.css`. Diverifikasi langsung pada CSS
hasil build: nol aturan dihasilkan.

Token yang benar-benar ada: `--color-background`, `--color-surface`,
`--color-text-main`, `--color-text-muted`, `--color-primary`,
`--color-primary-contrast`, `--color-ai-accent`, `--color-border-glass`.

Dampak nyata: teks tombol primary mewarisi warna teks gelap di atas latar teal,
dan teks "muted" tidak muted. Perbaikannya satu tempat — tambahkan alias di blok
`@theme inline` pada `globals.css`, tanpa perlu menyentuh markup mana pun.

### 5.2 Request menggantung 30 detik saat database tidak terjangkau

`lib/mongodb.ts` mengembalikan koneksi yang sudah tersimpan di cache meski
koneksinya mati, lalu driver menunggu `serverSelectionTimeoutMS` bawaan Mongoose
sebelum menyerah:

```
http=500  time=30.004778s
```

Penanganan error di sisi halaman sudah benar, hanya saja user menatap layar
loading 30 detik sebelum melihat pesannya. Memengaruhi semua halaman.
Perbaikannya juga satu tempat: set `serverSelectionTimeoutMS` pada
`mongoose.connect()`.

---

## 6. Verifikasi

Halaman baru diuji lewat Chrome headless (CDP) terhadap MongoDB lokal sekali
pakai, dengan insight asli hasil `POST /api/insights/generate` — bukan data yang
disuntik manual. **16 dari 16 pemeriksaan lolos:**

- Tanpa sesi → diarahkan ke `/auth/login`
- Tautan detail muncul di kartu daftar tanpa mengganggu tombol tandai-baca
- Detail menampilkan tipe, pasangan metrik (`Stres & Tidur`), persentase
  keyakinan, dan rentang periode
- Tandai baca lalu batalkan — keduanya tersimpan dan dikonfirmasi lewat API
- Id tidak dikenal → status "tidak ditemukan" beserta tautan kembali

---

## 7. Putaran cleanup

### 7.1 Jejak dipindah ke `GET /api/jejak` — ya, memang lebih tepat

**Evaluasi.** Halaman ini bernama Jejak dan `/api/jejak` memang dibangun khusus
untuknya. Dengan `GET /api/check-ins`, action log dari Ruang dan insight tercatat
di database tapi tidak pernah terlihat di halaman yang seharusnya menampilkan
jejak. Kesimpulan: pindah.

**Perubahan.** `app/jejak` sekarang membaca `GET /api/jejak` dan merender tiga
bentuk entri:

| Tipe | Isi kartu | Tautan |
| --- | --- | --- |
| `CHECK_IN` | mood, statistik, factor, refleksi | `/check-in/[id]` |
| `ACTION_LOG` | judul latihan, status, kategori, durasi | — |
| `INSIGHT` | tipe, judul, deskripsi | `/insight/[id]` |

**Paginasi.** `/api/jejak` mengembalikan `items`, `page`, dan `limit` saja —
tidak ada `total` maupun `totalPages`. Jadi tombol "muat lebih banyak"
disimpulkan dari `items.length === limit`: halaman yang penuh berarti mungkin
masih ada lanjutannya, halaman yang kurang dari `limit` berarti sudah habis.
Baris jumlah total di header dihapus karena endpoint ini tidak menghitung.

Kartu `ACTION_LOG` sengaja tidak bisa diklik — tidak ada halaman detail untuk
action log, dan `data.actionId` bisa `null` kalau latihannya sudah dihapus
(ditangani dengan teks "Latihan yang sudah dihapus").

### 7.2 Bug laten di `GET /api/jejak`

Ditemukan saat integrasi: endpoint ini **selalu balas 500 di proses server yang
baru.**

```
MissingSchemaError: Schema hasn't been registered for model "Action".
```

Penyebabnya `.populate("actionId", …)` mencari model `Action` lewat registry
Mongoose, sementara route-nya hanya mengimpor `ActionLogModel`, `CheckInModel`,
dan `InsightModel` — tidak pernah `ActionModel`. Endpoint ini hanya bekerja
kalau kebetulan ada route lain yang mengimpor `ActionModel` (`/api/actions`,
`/api/action-logs`) sudah pernah dipanggil lebih dulu di proses yang sama. Itu
sebabnya bug ini lolos dari pemeriksaan manual sebelumnya.

**Perbaikan.** Modelnya dioper eksplisit, bukan dicari lewat nama:

```ts
.populate({ path: "actionId", select: "title type durationMinutes", model: ActionModel })
```

Ini satu-satunya perubahan pada `app/api/` di putaran cleanup — memperbaiki
endpoint yang sudah ada, bukan membuat API baru.

### 7.3 Edit check-in — ya, memang dibutuhkan

**Evaluasi.** Sebelumnya edit ditolak dengan alasan jurnal reflektif sebaiknya
tidak diubah. Alasan itu gugur oleh satu fakta: form di `app/check-in` sengaja
tidak mengirim `checkedInAt`, jadi entri selalu tercatat "sekarang". Artinya
satu-satunya jalur koreksi yang tersedia — hapus lalu tulis ulang — **tidak bisa
mengembalikan tanggal aslinya.** Salah ketik pada check-in kemarin praktis tidak
bisa diperbaiki. Menghapus pun sudah tersedia dan jauh lebih merusak daripada
mengubah. Kesimpulan: implementasikan.

**Perubahan.**

- `components/check-in-form.tsx` — form diekstrak agar dipakai bersama oleh
  create dan edit. Tanpa ini, sekitar 200 baris markup akan terduplikasi dan
  pasti melenceng seiring waktu.
- `app/check-in/[id]/edit/page.tsx` — memuat lewat `GET /api/check-ins/[id]`,
  menyimpan lewat `PATCH /api/check-ins/[id]`, lalu kembali ke halaman detail.
- `app/check-in/[id]/page.tsx` — tombol "Ubah" di samping "Hapus".
- `app/check-in/page.tsx` — memakai form bersama; perilaku tidak berubah.

**`checkedInAt` tidak pernah dikirim saat edit.** Mengubah isi check-in tidak
boleh memindahkannya ke hari lain. Ini diverifikasi eksplisit dalam pengujian.

### 7.4 Verifikasi

Chrome headless (CDP) terhadap MongoDB lokal sekali pakai. **48 pemeriksaan,
semuanya lolos** (34 + 14):

Jejak — ketiga tipe entri muncul; action log "Napas 4-7-8" kini terlihat padahal
sebelumnya tidak; status, kategori, dan durasi tampil; urutan menurun ketat;
tautan detail benar untuk check-in dan insight; paginasi pada 26 entri memuat
20 lalu menambah 6, tanpa duplikat, dan tombolnya hilang di halaman terakhir.

Edit — form terisi persis dari data tersimpan (termasuk optional kosong yang
tetap kosong); perubahan tersimpan; field yang tidak disentuh tetap utuh;
**`checkedInAt` tidak bergeser**; id rusak maupun tidak dikenal → "tidak
ditemukan"; tanpa sesi → `/auth/login`.

Create — regresi setelah ekstraksi form: form kosong, slider default 5, mood
tetap wajib, simpan → `/jejak`, optional kosong tersimpan sebagai `null`.
