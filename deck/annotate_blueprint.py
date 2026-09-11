#!/usr/bin/env python3
"""Add the design-system preamble and per-slide UI wireframes to the blueprint.

    python deck/annotate_blueprint.py

The blueprint already carries each slide's copy and a prose `### Visual` note.
What it lacked was the *system* behind those notes: which token paints what,
which type size lands where, and what the finished slide actually looks like.
This writes both in, drawing every value from the real sources rather than
inventing them:

  * colours   -> `app/globals.css` :root tokens
  * theme map -> `deck/build_template.py` CLR_SCHEME
  * type      -> `app/layout.tsx` + the Pt() sizes in `deck/build_deck.py`
  * geometry  -> the placeholder boxes of `RuangPijar_MindCraft_2026.pptx`

Artwork is deliberately NOT named or generated here. Every image region is left
as an empty, dimensioned slot (`[ASET-nX]`) for the author to fill by hand, so
the blueprint states the reserved space without committing to a picture. This
only affects the document — `build_deck.py` still auto-fills the .pptx.

Re-runnable: existing `### Gambaran UI` sections and an existing preamble are
stripped before the new ones go in.
"""

from __future__ import annotations

import re
from pathlib import Path

DECK = Path(__file__).resolve().parent
BLUEPRINT = DECK / "Blueprint_PPTX_MindCraft_Web_Competition_2026.md"

WIDTH = 78


def frame(lines: list[str]) -> str:
    """Draw the wireframe box, padding every row to one common width."""
    over = [ln for ln in lines if len(ln) > WIDTH]
    if over:
        raise SystemExit(
            "wireframe line exceeds width:\n  "
            + "\n  ".join(f"{len(ln)}: {ln}" for ln in over)
        )
    out = ["┌" + "─" * WIDTH + "┐"]
    out += ["│" + ln.ljust(WIDTH) + "│" for ln in lines]
    out += ["└" + "─" * WIDTH + "┘"]
    return "```\n" + "\n".join(out) + "\n```"


BAR = 48  # width of the proportion bar field, so every percent lines up

PROPORSI = "```\n" + "\n".join(
    f"{name:<5}  {hexcode}  {'█' * blocks + tail:<{BAR}}  {pct:>4}  {role}"
    for name, hexcode, blocks, tail, pct, role in [
        ("ivory", "#FAF8F4", 48, "", "~70%", "kanvas"),
        ("putih", "#FFFFFF", 12, "", "~15%", "kartu"),
        ("plum", "#5B3A52", 6, "", "~8%", "judul & header kolom"),
        ("ink", "#292525", 4, "", "~5%", "body copy"),
        ("peach", "#E9A68D", 1, "", "~2%", "aksen, garis pemisah"),
        ("sage", "#8FA58D", 0, "▌", "<1%", "penanda status"),
    ]
) + "\n```"


PREAMBLE_HEAD = f"""# Sistem Desain Deck

> Bagian ini bukan slide. Ini acuan tunggal untuk lima belas slide di bawahnya.
> Seluruh nilainya diambil langsung dari produk — token warna dari `app/globals.css`,
> tipografi dari `app/layout.tsx` — lalu ditanam ke template PPTX lewat
> `deck/build_template.py`. Deck dan aplikasi memakai sistem yang sama persis;
> itu yang membuat presentasi ini terbaca sebagai produknya, bukan sebagai slide
> yang kebetulan memuat screenshot-nya.

> **Aset gambar tidak di-generate.** Setiap area gambar di dokumen ini sengaja
> dibiarkan kosong dan hanya ditandai ukuran serta posisinya (`[ASET-nX]`).
> Isinya disediakan manual oleh tim. Lihat [Aset — Disediakan Manual](#aset--disediakan-manual).

## Kanvas & Grid

| Properti | Nilai |
| --- | --- |
| Ukuran slide | 13,333" × 7,5" — 16:9 (setara 1920 × 1080 px) |
| Margin aman | 0,17" untuk placeholder, 0,25" untuk teks bebas |
| Baris judul | `top 0,40"` · tinggi 1,18" · lebar 12,99" |
| Nomor slide | `L 11,73" · T 0,09"` — chip kecil, selalu di kanan atas |
| Baris headline | `top 1,40"` h 0,46" (layout grid) · `top 1,50"` h 0,50" (layout kolom) |
| Awal konten | `top 1,79"` (kolom) · `top 2,02"` (grid, tabel, diagram) |
| Kolom 3 | L 0,17 / 5,14 / 10,11 — lebar 3,05" |
| Kolom 4 | L 0,17 / 3,49 / 6,81 / 10,12 — lebar 3,05" |
| Kolom 5 | L 0,17 / 2,82 / 5,47 / 8,12 / 10,77 — lebar 2,41" |
| Panel gambar kanan | L 6,74" · T 0,97" · 6,59" × 5,40" |
| Radius kartu | 0,18" pada grid · 0,24" pada panel tunggal |
| Garis | 0,75–1 pt, selalu `--border-glass`; tidak pernah hitam |

Aturan yang tidak dilanggar di slide mana pun: **satu ide per slide, satu warna
aksen per slide, dan tidak ada kotak berbingkai hitam.** Struktur dibentuk oleh
jarak dan permukaan, bukan oleh garis tebal.

## Token Warna

Nilai di kolom pertama adalah nama variabel yang benar-benar ada di
`app/globals.css`. Kolom terakhir adalah slot tema PowerPoint tempat token itu
dipasang, sehingga siapa pun yang membuka file `.pptx` mendapat palet yang sama
tanpa perlu menyalin hex satu per satu.

| Token | Hex | Peran di produk | Peran di slide | Slot tema PPTX |
| --- | --- | --- | --- | --- |
| `--background` | `#FAF8F4` | Latar seluruh aplikasi | Kanvas semua slide terang | `lt1` |
| `--surface` | `#FFFFFF` | Permukaan kartu | Kartu aset & baris tabel genap | `lt2` |
| `--surface-muted` | `#EEE5EC` | Chip, latar pasif | Isian lembut, chip kategori | `accent4` |
| `--peach-subtle` | `#F8E7DF` | Sorotan hangat | Blok kutipan, highlight kalimat | `accent5` |
| `--sage` | `#8FA58D` | Penanda positif | Penanda status "selesai" | `accent3` |
| `--sage-soft` | `#E7EFE5` | Latar penanda positif | Isian penanda positif | — |
| `--text-main` | `#292525` | Teks utama | Body copy & headline band | `dk1` |
| `--text-muted` | `#746E6A` | Teks sekunder | Footnote, kredit, label swatch | `accent6` |
| `--primary` | `#5B3A52` | Warna merek (plum) | Judul slide, header kolom, tautan | `dk2` · `accent1` · `hlink` |
| `--primary-hover` | `#432B3D` | Status hover tombol | Bidang plum yang lebih pekat | — |
| `--accent` | `#E9A68D` | Aksen peach | Garis pemisah, penanda alur | `accent2` |
| `--primary-contrast` | `#FFFFFF` | Teks di atas plum | Teks di header tabel | — |
| `--ai-accent` | `#6D28D9` | Penanda fitur insight | *Tidak dipakai di deck* | — |
| `--border-glass` | `#E8E2DC` | Garis tepi kartu | Garis tepi seluruh kartu & bentuk | — |

### Proporsi pemakaian

Setiap slide menjaga perbandingan yang sama, supaya lima belas slide terasa satu
napas dan mata tidak lelah:

{PROPORSI}

### Kontras (WCAG 2.1, dihitung pada palet di atas)

| Kombinasi | Rasio | Status |
| --- | --- | --- |
| `--text-main` di atas `--background` | 14,3 : 1 | AAA — pasangan baku body copy |
| `--text-main` di atas `--surface` | 15,2 : 1 | AAA |
| `--primary` di atas `--background` | 9,1 : 1 | AAA — judul & header kolom |
| `--background` di atas `--primary` | 9,1 : 1 | AAA — slide penutup |
| `--primary-contrast` di atas `--primary` | 9,7 : 1 | AAA — header tabel |
| `--text-muted` di atas `--background` | 4,7 : 1 | AA — **minimal 12 pt**, hanya untuk footnote |
| `--accent` di atas `--background` | 1,9 : 1 | **Dekoratif saja** — tidak pernah untuk teks |
| `--sage` di atas `--background` | 2,5 : 1 | **Dekoratif saja** — tidak pernah untuk teks |

Konsekuensi praktisnya: peach dan sage hanya boleh muncul sebagai garis, isian,
atau penanda — dan setiap penanda berwarna selalu didampingi label teks, persis
seperti aturan "warna bukan penanda tunggal" yang dipakai di aplikasinya.

## Tipografi

Tiga typeface, masing-masing dengan satu tugas. Tidak ada typeface keempat.

| Peran | Typeface | Variabel CSS | Dipakai untuk |
| --- | --- | --- | --- |
| Display | **Sora** | `--font-sora` → `font-display` | Judul slide, headline, header kolom, angka |
| Body | **Plus Jakarta Sans** | `--font-plus-jakarta-sans` → `font-sans` | Seluruh isi kalimat, footnote, kredit |
| Mono | **JetBrains Mono** | `--font-jetbrains-mono` → `font-mono` | Endpoint (`POST /api/check-ins`), rute, nilai ambang |

Dua yang pertama ditanam ke dalam file `.pptx` sebagai *font scheme* bernama
`RuangPijar` — `majorFont` = Sora, `minorFont` = Plus Jakarta Sans — sehingga
slide baru yang dibuat siapa pun otomatis ikut, tanpa perlu disetel manual.
JetBrains Mono dipasang per-run, hanya di tempat yang memang memuat kode.

### Skala tipe di slide

| Elemen | Ukuran | Typeface | Warna |
| --- | --- | --- | --- |
| Judul cover | 54 pt · Bold | Sora | `--primary` |
| Headline penutup | 44 pt | Sora | `--background` di atas plum |
| Tagline cover | 25 pt | Sora | `--text-main` |
| Judul slide | 24 pt | Sora | `--primary` |
| Sampel tipe (slide 13) | 19 pt · Bold | Sora | `--primary` |
| Headline band | 15 pt · Bold | Sora | `--text-main` |
| Baris alur cover | 13 pt · Bold | Sora | `--primary` |
| Header tabel | 12,5 pt | Sora | `--primary-contrast` di atas plum |
| Kredit & kontak | 12,5 pt | Plus Jakarta Sans | `--text-muted` / ivory |
| Isi tabel | 11,5 pt | Plus Jakarta Sans | `--text-main` |
| Header kolom | 11 pt · Bold | Sora | `--primary` |
| Body copy kolom | 11 pt | Plus Jakarta Sans | `--text-main` |
| Label swatch | 10 pt | Plus Jakarta Sans | `--text-muted` |

**Batas bawah 10 pt.** Apa pun yang lebih kecil dari itu tidak terbaca dari
barisan belakang ruang juri, jadi konten yang tidak muat dipindahkan ke catatan
pembicara — bukan dikecilkan.

### Skala tipe di produk (untuk slide yang memuat screenshot)

Agar screenshot dan slide tidak saling bertengkar, hierarki di aplikasi memakai
tangga yang sama bentuknya: `text-5xl` (48 px) dan `text-4xl` (36 px) untuk
hero, `text-3xl`/`text-2xl` untuk judul bagian, `text-lg` untuk pengantar,
`text-sm` (14 px) untuk mayoritas antarmuka, `text-xs` untuk metadata. Bobot
dibatasi pada `font-medium` (500), `font-semibold` (600), dan `font-bold` (700).

### Penamaan fitur

Fitur disebut dengan **namanya**, bukan dengan path-nya:

| Tulis begini | Bukan begini |
| --- | --- |
| **Check-In** | ~~`/check-in`~~ |
| **Jejak** | ~~`/jejak`~~ |
| **Insight** | ~~`/insight`~~ |
| **Ruang** | ~~`/ruang`~~ |

Nama fitur diset 11 pt Sora Bold `--primary` — sama seperti header kolom, karena
memang itu perannya. Path dan endpoint hanya muncul di dua slide, yaitu tempat
yang memang sedang membicarakan alamatnya: **slide 10 (Arsitektur Teknologi)**
dan **slide 11 (Cara Kerja Sistem)**. Di sana formatnya JetBrains Mono, misalnya
`POST /api/check-ins`. Di luar dua slide itu, path tidak pernah tampil.

## Komponen Visual Berulang

| Komponen | Spesifikasi |
| --- | --- |
| **Kartu aset** | `--surface` · garis `--border-glass` 0,75 pt · radius 0,18–0,24" · padding 0,34" (grid) / 0,55" (tunggal). Kartu digambar lebih dulu; asetnya menyusul di atasnya. |
| **Garis pemisah** | `--accent` setinggi 1,5 pt, panjang 3,2" — hanya di cover. |
| **Header kolom** | Sora Bold `--primary`, di atas body `--text-main`, dipisah jarak, bukan garis. |
| **Chip nomor slide** | Kanan atas, `--text-muted`, tidak pernah pada cover dan penutup. |
| **Tabel** | Header plum + teks ivory; baris berselang-seling `--surface` / `--background`; margin sel 0,18"; tanpa garis kisi. |
| **Blok kode / endpoint** | JetBrains Mono, `--surface-muted` sebagai isian, tanpa garis tepi. |
"""


ASET_NOTE = """## Aset — Disediakan Manual

**Tidak ada aset gambar yang dibuat atau ditentukan di dokumen ini.** Setiap area
gambar pada wireframe di bawah digambar sebagai kotak putus-putus kosong dengan
ID, ukuran, dan posisinya saja:

```
┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐
┊                ┊   kotak putus-putus = ruang yang sudah dipesan,
┊  [ ASET-2A ]   ┊   isinya belum ditentukan
┊  3,05 × 2,72"  ┊
┊                ┊   → diisi manual, bukan hasil generate
└┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
```

Yang sudah dipastikan hanyalah **ruang kosongnya**: posisi, ukuran, rasio, dan
perlakuan bingkainya. Apa pun yang akhirnya ditaruh di situ — ilustrasi,
screenshot, mockup, foto, diagram — tinggal dipasang tanpa menggeser tata letak,
selama rasionya dijaga.

### Aturan pemasangan

| Hal | Ketentuan |
| --- | --- |
| Format | PNG atau WebP; SVG untuk logo dan diagram vektor |
| Resolusi | Minimal 2× ukuran cetak slide (mis. slot 3,05" → ≥ 880 px lebar) |
| Latar | Transparan bila akan ditaruh di atas kartu `--surface` atau bidang plum |
| Rasio | Ikuti kolom "Rasio"; bila beda, *fit* ke dalam slot — jangan *crop* isi penting |
| Perlakuan | Di bidang terang: di atas kartu `--surface` + garis `--border-glass`. Di bidang plum (slide 15): potongan tanpa kartu — kartu putih akan merobek bidangnya |
| Batas | Maksimal satu aset dominan per slide; slot sekunder tetap kecil |
| Slot kosong | Bila sebuah slot tidak jadi diisi, **hapus kartunya juga** — kartu kosong terbaca sebagai lubang, bukan sebagai ruang |

### Daftar slot

"""

ASET_TABLE_HEAD = (
    "| ID | Slide | Isi | Posisi | Ukuran | Rasio |\n"
    "| --- | --- | --- | --- | --- | --- |\n"
)


# --------------------------------------------------------------------------- #
# per-slide wireframes
# --------------------------------------------------------------------------- #

UI: dict[int, dict] = {}

UI[1] = {
    "layout": "`title-centered` (index 2) — disusun ulang oleh `build_cover()`",
    "art": [
        " ░ Kanvas penuh --background #FAF8F4 · tanpa header, tanpa nomor slide",
        "",
        "  ┌┄┄┄┄┄┄┄┄┄┄┐                    ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "  ┊[ASET-1A] ┊                    ┊                              ┊",
        "  ┊ h 1,05\"  ┊                    ┊                              ┊",
        "  └┄┄┄┄┄┄┄┄┄┄┘                    ┊                              ┊",
        "   L0,95\" T1,15\"                  ┊        [ ASET-1B ]           ┊",
        "                                  ┊        4,9\" × 4,9\"           ┊",
        "  RuangPijar                      ┊        L7,53\"  T1,30\"        ┊",
        "  ██████████████████              ┊                              ┊",
        "  54pt Sora Bold · --primary      ┊                              ┊",
        "                                  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "  Ruang kecil untuk memahami       kartu --surface · r 0,24\"",
        "  dirimu.                          isinya menyusul",
        "  25pt Sora · --text-main",
        "",
        "  ▬▬▬▬▬▬▬▬▬▬  rule --accent #E9A68D · 3,2\" × 1,5pt · T4,45\"",
        "",
        "  MindCraft Web Competition 2026 · \"Building Digital Solutions…\"",
        "  Tim CH · Yogawan A. P. T. · S. Ridho E. · A. Gading S. · Latief R.",
        "  12,5pt Plus Jakarta Sans · --text-muted",
        "",
        "  Reflect  →  Record  →  Understand  →  Act",
        "  13pt Sora Bold · --primary · T6,05\"",
    ],
    "aset": [
        ("1A", "Penanda identitas kiri atas", "L 0,95\" · T 1,15\"", "tinggi 1,05\"", "bebas"),
        ("1B", "Bidang visual utama cover", "L 7,53\" · T 1,30\"", "4,9\" × 4,9\"", "1 : 1"),
    ],
    "token": "`--background` kanvas penuh · `--primary` judul · `--accent` garis · "
             "`--text-muted` kredit · `--surface` + `--border-glass` kartu ASET-1B",
    "type": "54pt Sora Bold → 25pt Sora → 13pt Sora Bold → 12,5pt Plus Jakarta Sans. "
            "Empat tingkat saja, supaya mata langsung jatuh ke nama produk.",
}

UI[2] = {
    "layout": "`content-image-top-4-body` (index 32) — 4 slot aset di atas, 4 blok teks di bawah",
    "art": [
        "  Latar Belakang & Urgensi                                        ▫ 2",
        "  24pt Sora · --primary · T0,40\"                        chip L11,73\" T0,09\"",
        "",
        "  Kita baru menyadarinya ketika semuanya sudah terasa terlalu berat.",
        "  15pt Sora Bold · --text-main · band T1,40\" h0,46\"",
        "",
        "  ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐  ← T2,02\"",
        "  ┊           ┊ ┊           ┊ ┊           ┊ ┊           ┊    h 2,72\"",
        "  ┊ [ASET-2A] ┊ ┊ [ASET-2B] ┊ ┊ [ASET-2C] ┊ ┊ [ASET-2D] ┊    w 3,05\"",
        "  ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊    r 0,18\"",
        "  ┊           ┊ ┊           ┊ ┊           ┊ ┊           ┊",
        "  └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘",
        "   L0,17\"       L3,49\"        L6,81\"        L10,12\"",
        "",
        "  Akademik      Keseharian    Sosial &      Yang Riset      ← T4,76\"",
        "  ▔▔▔▔▔▔▔▔      ▔▔▔▔▔▔▔▔▔▔    Personal      Katakan           h 2,56\"",
        "  Tuntutan dan  Tidur yang    Hal-hal yang  Lattie dkk.",
        "  tenggat sa-   berantakan    disimpan      2019 — 80%",
        "  ling menim-   berhari-hari  sendiri       lewat website",
        "  pa.                                       dan efektif.",
        "",
        "  header kolom 11pt Sora Bold --primary · body 11pt Plus Jakarta Sans",
    ],
    "aset": [
        ("2A", "Pendamping kolom \"Akademik\"", "L 0,17\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("2B", "Pendamping kolom \"Keseharian\"", "L 3,49\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("2C", "Pendamping kolom \"Sosial & Personal\"", "L 6,81\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("2D", "Pendamping kolom \"Yang Riset Katakan\"", "L 10,12\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
    ],
    "token": "`--surface` empat kartu · `--border-glass` garis tepinya · `--primary` "
             "judul & header kolom · `--text-main` body · `--peach-subtle` untuk "
             "menyorot kalimat penutup bila dipakai",
    "type": "24pt Sora → 15pt Sora Bold → 11pt Sora Bold → 11pt Plus Jakarta Sans. "
            "Kutipan riset turun ke footnote, tidak ditulis sebagai paragraf.",
}

UI[3] = {
    "layout": "`content-image-right-a` (index 3) — daftar di kiri, satu slot aset penuh di kanan",
    "art": [
        "  Pengenalan Platform                                             ▫ 3",
        "  24pt Sora · --primary · T0,40\" · lebar 6,42\"",
        "",
        "  ┌──────────────────────────────┐  ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "  │ body  L0,17\" T2,18\"          │  ┊                             ┊",
        "  │       6,30\" × 4,92\"          │  ┊                             ┊",
        "  │                              │  ┊                             ┊",
        "  │ Dua menit sehari, untuk      │  ┊                             ┊",
        "  │ melihat apa yang sedang      │  ┊       [ ASET-3A ]           ┊",
        "  │ terjadi pada dirimu.         │  ┊       6,59\" × 5,40\"         ┊",
        "  │ 15pt Sora Bold               │  ┊       L6,74\" · T0,97\"       ┊",
        "  │                              │  ┊                             ┊",
        "  │ ▸ Terasa seperti percakapan  │  ┊                             ┊",
        "  │ ▸ Pola dari datamu sendiri   │  ┊                             ┊",
        "  │ ▸ Berujung pada langkah      │  ┊                             ┊",
        "  │   kecil                      │  ┊                             ┊",
        "  │                              │  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "  │ Empat halaman utama:         │   kartu --surface · r 0,24\"",
        "  │ Check-In · Jejak ·           │",
        "  │ Insight · Ruang              │   chip: \"Gratis · Privat · ±2 menit\"",
        "  └──────────────────────────────┘   --surface-muted · 10pt",
    ],
    "aset": [
        ("3A", "Bidang visual utama pengenalan produk", "L 6,74\" · T 0,97\"", "6,59\" × 5,40\"", "1,22 : 1"),
    ],
    "token": "`--background` kanvas · `--surface` kartu ASET-3A · `--surface-muted` chip "
             "· `--primary` judul dan nama fitur · `--text-main` body",
    "type": "Nama fitur ditulis sebagai nama — **Check-In, Jejak, Insight, Ruang** — "
            "11pt Sora Bold `--primary`, bukan sebagai path. Path hanya tampil di slide "
            "10 dan 11, tempat yang memang sedang membicarakan endpoint.",
}

UI[4] = {
    "layout": "`content-image-top-4-body` (index 32) — empat fase sebagai kartu berurutan",
    "art": [
        "  Konsep & Pendekatan Solusi                                      ▫ 4",
        "",
        "  Mencatat saja tidak cukup. Lingkarannya harus ditutup.",
        "  15pt Sora Bold · band T1,40\"",
        "",
        "  ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐  ← T2,02\"",
        "  ┊ [ASET-4A] ┊ ┊ [ASET-4B] ┊ ┊ [ASET-4C] ┊ ┊ [ASET-4D] ┊    h 2,72\"",
        "  ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊    w 3,05\"",
        "  └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘",
        "        │             │             │             │",
        "        ▼             ▼             ▼             ▼",
        "  1. REFLECT    2. RECORD     3. UNDERSTAND 4. ACT",
        "  ▔▔▔▔▔▔▔▔▔▔    ▔▔▔▔▔▔▔▔▔     ▔▔▔▔▔▔▔▔▔▔▔▔▔ ▔▔▔▔▔▔        ← T4,76\"",
        "  Check-In      Jejak         Insight       Ruang",
        "",
        "  Kondisi hari- Satu hari     Pola tidak    Tahu saja",
        "  an tidak      tidak ber-    muncul        tidak meng-",
        "  terbaca →     cerita → satu sendiri →     ubah apa pun",
        "  dua menit     rentang yang  dibaca dan    → satu",
        "  mencatatnya.  bisa dilihat. ditunjukkan.  langkah kecil.",
        "",
        "  ↺  panah balik --accent dari kolom 4 ke kolom 1 — lingkaran, bukan garis",
    ],
    "aset": [
        ("4A", "Penanda fase 1 — Reflect / Check-In", "L 0,17\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("4B", "Penanda fase 2 — Record / Jejak", "L 3,49\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("4C", "Penanda fase 3 — Understand / Insight", "L 6,81\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("4D", "Penanda fase 4 — Act / Ruang", "L 10,12\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
    ],
    "token": "`--primary` nomor & nama fase · `--accent` panah balik yang menutup "
             "lingkaran · `--text-muted` baris masalah · `--text-main` jawabannya",
    "type": "Nomor fase 11pt Sora Bold plum; nama fitur (Check-In, Jejak, Insight, "
            "Ruang) 11pt Sora Bold; masalah dan jawaban dibedakan warna, bukan ukuran.",
}

UI[5] = {
    "layout": "`content-image-right-a` (index 3) — butir di kiri, slot aset besar + inset kecil di kanan",
    "art": [
        "  Check-In                                                        ▫ 5",
        "",
        "  ┌──────────────────────────────┐  ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "  │ Kenali kondisi diri, sebelum │  ┊                             ┊",
        "  │ menentukan langkah berikutnya│  ┊                             ┊",
        "  │ 15pt Sora Bold               │  ┊                             ┊",
        "  │                              │  ┊      [ ASET-5A ]            ┊",
        "  │ ▸ Mood — lima wajah          │  ┊      6,59\" × 4,40\"          ┊",
        "  │   ilustratif                 │  ┊      L6,74\" · T0,97\"        ┊",
        "  │ ▸ Energi & stres — skala     │  ┊                             ┊",
        "  │   1–10                       │  ┊                             ┊",
        "  │ ▸ Tidur, beban akademik &    │  ┊                             ┊",
        "  │   sosial — opsional          │  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "  │ ▸ Sembilan faktor pemicu +   │",
        "  │   refleksi 2.000 karakter    │        ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "  │ ▸ Streak harian + email      │        ┊  [ ASET-5B ]     ┊",
        "  │   pengingat                  │        ┊  2,40\" × 1,40\"   ┊",
        "  │                              │        ┊  inset, T5,55\"   ┊",
        "  └──────────────────────────────┘        └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "                                           bukti umpan balik langsung",
        "  Anotasi tipis \"Boleh dikosongkan\" 10pt --text-muted, menunjuk ke slot 5A",
    ],
    "aset": [
        ("5A", "Bidang utama fitur Check-In", "L 6,74\" · T 0,97\"", "6,59\" × 4,40\"", "1,50 : 1"),
        ("5B", "Inset umpan balik streak", "L 8,90\" · T 5,55\"", "2,40\" × 1,40\"", "1,71 : 1"),
    ],
    "token": "`--surface` kartu 5A dan 5B · `--primary` progress bar terisi · "
             "`--surface-muted` progress kosong · `--sage` penanda jawaban positif "
             "(selalu berpasangan dengan label) · `--text-muted` anotasi opsional",
    "type": "Label mood 10pt Plus Jakarta Sans; angka skala 11pt Sora Bold. Apa pun "
            "isi slot 5A, aturannya tetap: wajah, label, dan warna tampil bersama.",
}

UI[6] = {
    "layout": "`grid-2x2-image-top-2-body-a` (index 42) — dua slot aset besar berdampingan",
    "art": [
        "  Jejak                                                           ▫ 6",
        "",
        "  Satu hari terasa biasa. Sebulan mulai bercerita.     band T1,40\"",
        "",
        "  ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐        ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "  ┊                       ┊        ┊                       ┊",
        "  ┊                       ┊        ┊                       ┊",
        "  ┊    [ ASET-6A ]        ┊ ─────▶ ┊    [ ASET-6B ]        ┊",
        "  ┊    4,22\" × 2,72\"      ┊ ketuk  ┊    4,22\" × 2,72\"      ┊",
        "  ┊    L0,97\" · T2,02\"    ┊        ┊    L8,14\" · T2,02\"    ┊",
        "  ┊                       ┊        ┊                       ┊",
        "  ┊                       ┊        ┊                       ┊",
        "  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘        └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "",
        "  Kalender Bulanan                 Latihan & Insight        ← T4,75\"",
        "  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔                 ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔          h 2,58\"",
        "  Hari terisi tampil berwarna;     Terbaru lebih dulu,",
        "  sebulan terbaca satu layar.      dimuat bertahap.",
        "  Ketuk tanggalnya untuk membaca   Latihan dari Ruang dan",
        "  ulang, dan catatan lama masih    pola yang ditemukan",
        "  bisa disunting.                  berkumpul di satu kolom.",
        "",
        "  Panah --accent di antara kedua slot menandai interaksi ketuk → detail",
    ],
    "aset": [
        ("6A", "Bidang kiri — tampilan rentang waktu", "L 0,97\" · T 2,02\"", "4,22\" × 2,72\"", "1,55 : 1"),
        ("6B", "Bidang kanan — tampilan feed", "L 8,14\" · T 2,02\"", "4,22\" × 2,72\"", "1,55 : 1"),
    ],
    "token": "`--surface` dua kartu · `--accent` panah interaksi ketuk · `--sage` "
             "penanda selesai bila muncul di dalam aset",
    "type": "Header panel 11pt Sora Bold plum. Angka tanggal apa pun yang muncul di "
            "slot 6A sebaiknya monospace, supaya kisinya tidak bergoyang.",
}

UI[7] = {
    "layout": "`content-image-top-4-body` (index 32) + satu kartu anatomi yang digambar, bukan aset",
    "art": [
        "  Insight                                                         ▫ 7",
        "",
        "  \"Oh, ternyata…\" — pola yang selama ini terlewat.",
        "",
        "  ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┐  ← T2,02\"",
        "  ┊ [ASET-7A] ┊ ┊ [ASET-7B] ┊ ┊ [ASET-7C] ┊ ┊ [ASET-7D] ┊    h 2,72\"",
        "  ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊ ┊ 3,05×2,72 ┊    w 3,05\"",
        "  └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┘",
        "  Keterkaitan   Tren          Pola          Selalu Ada",
        "  ▔▔▔▔▔▔▔▔▔▔▔   ▔▔▔▔          ▔▔▔▔          Dasarnya      ← T4,78\"",
        "  Jam tidur vs  Arah mood,    Faktor yang   ▔▔▔▔▔▔▔▔▔▔",
        "  tingkat stres stres, energi  paling sering Metrik, periode,",
        "                14 hari       muncul        keyakinan",
        "",
        "  ── anatomi kartu insight — DIGAMBAR dengan shape, bukan slot aset ──────",
        "  ╭──────────────────────────────────────────────────────────╮",
        "  │ [KETERKAITAN]  chip --surface-muted · 10pt                │ ← jenis",
        "  │ Tidur ↔ Stres              r = -0,62   JetBrains Mono     │ ← metrik",
        "  │ Malam dengan tidur < 6 jam cenderung diikuti stres tinggi │ ← judul",
        "  │ 14 hari terakhir · 11 check-in        --text-muted 10pt   │ ← periode",
        "  │ keyakinan 78%  ▰▰▰▰▰▰▰▰▱▱  --primary                      │ ← keyakinan",
        "  ╰──────────────────────────────────────────────────────────╯",
        "  footnote: \"Bukan diagnosis.\"   10pt Plus Jakarta Sans --text-muted",
    ],
    "aset": [
        ("7A", "Pendamping kolom \"Keterkaitan\"", "L 0,17\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("7B", "Pendamping kolom \"Tren\"", "L 3,49\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("7C", "Pendamping kolom \"Pola\"", "L 6,81\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
        ("7D", "Pendamping kolom \"Selalu Ada Dasarnya\"", "L 10,12\" · T 2,02\"", "3,05\" × 2,72\"", "1,12 : 1"),
    ],
    "token": "`--surface` empat kartu · `--surface-muted` chip jenis insight · "
             "`--primary` bar keyakinan · `--text-muted` periode & footnote. "
             "`--ai-accent` (#6D28D9) sengaja **tidak** dipakai di deck.",
    "type": "Kartu anatomi di bawah tidak memerlukan aset — seluruhnya shape dan teks. "
            "Nilai metrik (`r = -0,62`, `78%`) selalu JetBrains Mono.",
}

UI[8] = {
    "layout": "`content-image-right-a` (index 3) — butir di kiri, satu slot aset penuh di kanan",
    "art": [
        "  Ruang                                                           ▫ 8",
        "",
        "  ┌──────────────────────────────┐  ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "  │ Tidak harus melakukan semua-  │  ┊                             ┊",
        "  │ nya. Cukup satu hal kecil    │  ┊                             ┊",
        "  │ hari ini.                    │  ┊                             ┊",
        "  │ 15pt Sora Bold               │  ┊                             ┊",
        "  │                              │  ┊       [ ASET-8A ]           ┊",
        "  │ ▸ Tab \"Untuk kamu\" membaca   │  ┊       6,59\" × 5,40\"         ┊",
        "  │   lima check-in terakhir     │  ┊       L6,74\" · T0,97\"       ┊",
        "  │ ▸ Enam kategori untuk        │  ┊                             ┊",
        "  │   ditelusuri sendiri         │  ┊                             ┊",
        "  │ ▸ Jenis & durasi tampil      │  ┊                             ┊",
        "  │   sebelum dimulai            │  ┊                             ┊",
        "  │ ▸ Mulai → Selesai atau       │  ┊                             ┊",
        "  │   Lewati; keduanya tercatat  │  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "  │                              │",
        "  │ ┃ \"Disarankan dari check-in  │   Sorotan --peach-subtle di kiri",
        "  │ ┃  terakhirmu: Akademik,     │   adalah satu-satunya aksen hangat",
        "  │ ┃  Tidur.\"                   │   di slide ini — digambar, bukan aset",
        "  └──────────────────────────────┘",
    ],
    "aset": [
        ("8A", "Bidang utama halaman Ruang", "L 6,74\" · T 0,97\"", "6,59\" × 5,40\"", "1,22 : 1"),
    ],
    "token": "`--primary` chip kategori aktif · `--surface-muted` chip pasif · "
             "`--sage` status \"sedang berjalan\" · `--peach-subtle` blok kalimat alasan "
             "— satu-satunya sorotan hangat di slide ini",
    "type": "Nama latihan 11pt Sora Bold; jenis & durasi 10pt Plus Jakarta Sans "
            "`--text-muted`, supaya komitmen waktu terbaca sebelum tombol ditekan.",
}

UI[9] = {
    "layout": "`column-5-centered` (index 27) — lima tahap sejajar, slot aset kecil opsional",
    "art": [
        "  Alur Pengguna End-to-End                                        ▫ 9",
        "",
        "  Setiap langkah menyiapkan bahan untuk langkah berikutnya.   band T1,50\"",
        "",
        "  ┌┄┄┄┄┄┄┄┐   ┌┄┄┄┄┄┄┄┐   ┌┄┄┄┄┄┄┄┐   ┌┄┄┄┄┄┄┄┐   ┌┄┄┄┄┄┄┄┐  ← T1,90\"",
        "  ┊ ASET- ┊   ┊ ASET- ┊   ┊ ASET- ┊   ┊ ASET- ┊   ┊ ASET- ┊    opsional",
        "  ┊  9A   ┊   ┊  9B   ┊   ┊  9C   ┊   ┊  9D   ┊   ┊  9E   ┊    1,10\" ×",
        "  └┄┄┄┄┄┄┄┘   └┄┄┄┄┄┄┄┘   └┄┄┄┄┄┄┄┘   └┄┄┄┄┄┄┄┘   └┄┄┄┄┄┄┄┘    0,90\"",
        "  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐",
        "  │ 1.      │ │ 2.      │ │ 3.      │ │ 4.      │ │ 5.      │  kolom",
        "  │ MALAM   │ │ SAAT    │ │ SETELAH │ │ HARI    │ │ KEMBALI │  w 2,41\"",
        "  │ INI     │ │ ITU     │ │ BEBERAPA│ │ BERIKUT-│ │ KE AWAL │",
        "  │         │ │ JUGA    │ │ HARI    │ │ NYA     │ │         │",
        "  │ ▔▔▔▔▔▔▔ │ │ ▔▔▔▔▔▔▔ │ │ ▔▔▔▔▔▔▔ │ │ ▔▔▔▔▔▔▔ │ │ ▔▔▔▔▔▔▔ │",
        "  │ Dua     │ │ Jejak   │ │ \"Cari   │ │ Ruang   │ │ Latihan │",
        "  │ menit   │ │ bertam- │ │ pola    │ │ menye-  │ │ ter-    │",
        "  │ di      │ │ bah     │ │ baru\"   │ │ suaikan │ │ catat   │",
        "  │ Check-  │ │ satu    │ │ ditekan │ │ saran   │ │ lagi di │",
        "  │ In      │ │ hari    │ │         │ │         │ │ Jejak   │",
        "  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘",
        "   L0,17\"     L2,82\"      L5,47\"      L8,12\"      L10,77\"",
        "       ╰──────────◀───────────────────────────────────╯",
        "  pita --surface-muted 10pt JetBrains Mono, di bawah alur:",
        "  mood, energi, stres, faktor → riwayat → pola → saran → catatan baru",
    ],
    "aset": [
        ("9A", "Penanda tahap 1 — opsional", "L 0,82\" · T 1,90\"", "1,10\" × 0,90\"", "1,22 : 1"),
        ("9B", "Penanda tahap 2 — opsional", "L 3,47\" · T 1,90\"", "1,10\" × 0,90\"", "1,22 : 1"),
        ("9C", "Penanda tahap 3 — opsional", "L 6,12\" · T 1,90\"", "1,10\" × 0,90\"", "1,22 : 1"),
        ("9D", "Penanda tahap 4 — opsional", "L 8,77\" · T 1,90\"", "1,10\" × 0,90\"", "1,22 : 1"),
        ("9E", "Penanda tahap 5 — opsional", "L 11,42\" · T 1,90\"", "1,10\" × 0,90\"", "1,22 : 1"),
    ],
    "token": "`--primary` nomor & nama tahap · `--accent` panah balik · "
             "`--surface-muted` pita aliran data di bawah · `--text-main` isi tahap",
    "type": "Kelima slot bersifat opsional — tanpa aset pun slide ini utuh, karena "
            "nomor tahap 11pt Sora Bold sudah memikul hierarkinya sendiri.",
}

UI[10] = {
    "layout": "`title-centered` (index 2) + tabel — tanpa slot aset, seluruhnya digambar",
    "art": [
        "  Arsitektur Teknologi                                           ▫ 10",
        "",
        "  Next.js App Router berperan sekaligus sebagai antarmuka dan BFF.",
        "",
        "  ┌───────────────┬────────────────────────────────────────┐   ╭────────╮",
        "  │  LAPISAN      │  ISI                                   │   │Auth.js │",
        "  │  plum #5B3A52 · teks ivory · 12,5pt Sora · h 0,62\"     │   │+ Google│",
        "  ├───────────────┼────────────────────────────────────────┤   ╰────────╯",
        "  │  Browser      │  React 19 · Tailwind v4 · GSAP         │   ╭────────╮",
        "  │  --surface    │  react-joyride · Lucide                │   │Cloudi- │",
        "  ├───────────────┼────────────────────────────────────────┤   │nary    │",
        "  │  App Router   │  UI + Route Handlers (BFF)             │   ╰────────╯",
        "  │  --background │  /api/check-ins · jejak · insights ·   │   ╭────────╮",
        "  │               │  actions · action-logs · cron          │   │SMTP +  │",
        "  ├───────────────┼────────────────────────────────────────┤   │Vercel  │",
        "  │  Mongoose     │  User · CheckIn · Insight · Action ·   │   │Cron    │",
        "  │  --surface    │  ActionLog · Personalization           │   │01.00   │",
        "  ├───────────────┼────────────────────────────────────────┤   ╰────────╯",
        "  │  MongoDB      │  Satu basis data, satu sumber kebenaran│",
        "  └───────────────┴────────────────────────────────────────┘   layanan",
        "     kolom 24%        kolom 76%                                eksternal",
        "  Tabel L0,25\" T2,02\" · 9,50\" × 4,25\" · baris berselang, tanpa garis kisi",
        "  isi tabel 11,5pt Plus Jakarta Sans · nama endpoint JetBrains Mono",
    ],
    "aset": [],
    "token": "Header tabel `--primary` dengan teks `--primary-contrast` (9,7:1) · "
             "baris berselang `--surface` dan `--background` · kotak layanan eksternal "
             "`--surface` + `--border-glass`",
    "type": "Header 12,5pt Sora · isi 11,5pt Plus Jakarta Sans · endpoint JetBrains Mono. "
            "Setiap panah diberi label endpoint sebenarnya, bukan label generik.",
}

UI[11] = {
    "layout": "`column-3-centered-a` (index 35) — tanpa slot aset, seluruhnya digambar",
    "art": [
        "  Cara Kerja Sistem                                              ▫ 11",
        "",
        "  Dari satu check-in menjadi satu pola — tiap langkahnya bisa diperiksa.",
        "",
        "  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐  T1,79\"",
        "  │ 1. INPUT       │    │ 2. PROCESSING  │    │ 3. OUTPUT      │  h 5,54\"",
        "  │ ▔▔▔▔▔▔▔▔       │ ─▶ │ ▔▔▔▔▔▔▔▔▔▔▔▔▔  │ ─▶ │ ▔▔▔▔▔▔▔▔▔      │  w 3,05\"",
        "  │                │    │                │    │                │",
        "  │ POST           │    │ POST /api/     │    │ Kandidat lolos │",
        "  │ /api/check-ins │    │ insights/      │    │ disimpan +     │",
        "  │                │    │ generate       │    │ metrik,        │",
        "  │ Sesi diverifi- │    │ 14 hari · min. │    │ periode,       │",
        "  │ kasi, catatan  │    │ 3 catatan      │    │ keyakinan      │",
        "  │ terikat userId │    │                │    │                │",
        "  │                │    │ ┌────────────┐ │    │ Tampil sebagai │",
        "  │ Streak di-     │    │ │Tren  ≥0,75 │ │    │ kartu di       │",
        "  │ perbarui       │    │ │Kait |r|≥0,4│ │    │ Insight        │",
        "  │                │    │ │Pola  ≥ 40% │ │    │                │",
        "  │                │    │ └────────────┘ │    │                │",
        "  └────────────────┘    └───────┬────────┘    └────────────────┘",
        "   L0,17\"                       │              L10,11\"",
        "                                ▼  jalur gagal juga ditangani",
        "                    ┌─────────────────────────┐",
        "                    │ \"Belum cukup data.\"     │  --surface-muted",
        "                    └─────────────────────────┘",
    ],
    "aset": [],
    "token": "`--primary` nomor & nama blok · tiga gerbang aturan sebagai kotak "
             "`--surface` di dalam blok tengah · `--surface-muted` kotak jalur gagal "
             "— sengaja redup, tetapi tetap tampil",
    "type": "Ambang angka (`≥ 0,75`, `|r| ≥ 0,4`, `≥ 40%`) ditulis JetBrains Mono dan "
            "tidak pernah disembunyikan — itu inti klaim \"deterministik\".",
}

UI[12] = {
    "layout": "`column-4-centered` (index 31) — tanpa slot aset, seluruhnya digambar",
    "art": [
        "  Metodologi Riset                                               ▫ 12",
        "",
        "  Dikembangkan bertahap, dengan pengujian sebagai penutup tiap siklus.",
        "",
        "  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐",
        "  │ 1.           │ │ 2.           │ │ 3.           │ │ 4.           │",
        "  │ IDENTIFIKASI │ │ PERANCANGAN  │ │ PENGEMBANGAN │ │ PENGUJIAN    │",
        "  │ ▔▔▔▔▔▔▔▔▔▔▔▔ │ │ ▔▔▔▔▔▔▔▔▔▔▔▔ │ │ ▔▔▔▔▔▔▔▔▔▔▔▔ │ │ ▔▔▔▔▔▔▔▔▔▔   │",
        "  │              │ │              │ │              │ │              │",
        "  │ Studi        │ │ Alur produk  │ │ Frontend,    │ │ Uji fungsio- │",
        "  │ literatur &  │ │ dan sistem   │ │ BFF, dan     │ │ nal tiap     │",
        "  │ guidebook    │ │ desain       │ │ basis data   │ │ endpoint     │",
        "  │              │ │              │ │              │ │              │",
        "  │ Perumusan    │ │ Skema data   │ │ Integrasi    │ │ Uji aturan   │",
        "  │ masalah      │ │ dan kontrak  │ │ layanan      │ │ insight &    │",
        "  │ pengguna     │ │ API          │ │ pendukung    │ │ aksesibili-  │",
        "  │              │ │              │ │              │ │ tas          │",
        "  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘",
        "   L0,17\"          L3,49\"           L6,81\"           L10,12\"",
        "       ╰────────────────◀────────────────────────────────╯",
        "              siklus berulang — panah balik --accent",
        "",
        "  Bila memakai template metodologi yang sudah tersedia: ganti isinya saja,",
        "  pertahankan grid empat kolom, judul 24pt Sora plum, dan palet di atas.",
    ],
    "aset": [],
    "token": "Sama dengan slide kerangka lain: `--primary` nomor & nama fase · "
             "`--text-main` isi · `--accent` panah siklus · tanpa kartu aset "
             "supaya slide ini terbaca sebagai proses, bukan sebagai galeri",
    "type": "Nama fase 11pt Sora Bold huruf kapital; isi 11pt Plus Jakarta Sans, "
            "maksimal dua butir per kolom agar tidak menyentuh batas 10pt.",
}

UI[13] = {
    "layout": "`column-3-centered-a` (index 35) + strip token — satu-satunya slide yang **menunjukkan** sistem desain",
    "art": [
        "  Nilai Tambah, UI/UX & Dampak                                   ▫ 13",
        "",
        "  Bukan yang paling pintar — yang paling bisa dipercaya.",
        "",
        "  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   T1,79\"",
        "  │ 1. INOVASI     │  │ 2. UI/UX       │  │ 3. PRIVASI &   │   h 4,26\"",
        "  │ ▔▔▔▔▔▔▔▔▔▔     │  │ ▔▔▔▔▔▔▔        │  │    ETIKA       │   w 3,05\"",
        "  │ Metrik,        │  │ Ruang yang     │  │ ▔▔▔▔▔▔▔▔       │",
        "  │ periode,       │  │ tenang, bukan  │  │ Tiap endpoint  │",
        "  │ keyakinan      │  │ dashboard      │  │ memeriksa sesi │",
        "  │                │  │                │  │                │",
        "  │ Bisa dijelas-  │  │ Panduan tur    │  │ Query terikat  │",
        "  │ kan, tanpa     │  │ tiap halaman,  │  │ userId, sandi  │",
        "  │ black-box      │  │ bisa diulang   │  │ disimpan hash  │",
        "  │                │  │                │  │                │",
        "  │ Pola dicari    │  │ Warna bukan    │  │ Refleksi, bukan│",
        "  │ saat diminta   │  │ penanda tunggal│  │ pengganti      │",
        "  └────────────────┘  └────────────────┘  └────────────────┘",
        "",
        "  ▄▄  ▄▄  ▄▄  ▄▄  ▄▄  ▄▄    Sora                 ┌┄┄┄┄┄┄┄┄┄┄┐",
        "  Ivory Plum Peach Sage      19pt Sora Bold plum  ┊[ASET-13A]┊",
        "  Muted Ink · chip 0,45\"     Plus Jakarta Sans    ┊1,3\"×1,3\" ┊",
        "  r 0,22\" · T6,25\"           · tipografi produk   └┄┄┄┄┄┄┄┄┄┄┘",
        "  label 10pt --text-muted    L4,19\" · T6,19\"       L11,43\" T6,15\"",
    ],
    "aset": [
        ("13A", "Penanda sudut kanan bawah — opsional", "L 11,43\" · T 6,15\"", "1,3\" × 1,3\"", "1 : 1"),
    ],
    "token": "Seluruh palet tampil sebagai bukti, bukan sebagai klaim: enam chip "
             "`--background` `--primary` `--accent` `--sage` `--surface-muted` "
             "`--text-main`, masing-masing 0,45\" dengan garis `--border-glass` 0,75 pt",
    "type": "Pasangan tipe ditampilkan sebagai spesimen — \"Sora\" 19pt Bold plum di atas "
            "\"Plus Jakarta Sans · tipografi produk\" 10,5pt `--text-muted`.",
}

UI[14] = {
    "layout": "`content-image-right-a` (index 3) — QR besar, gangguan seminimal mungkin",
    "art": [
        "  Live Demo                                                      ▫ 14",
        "",
        "  ┌──────────────────────────────┐  ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "  │ Dua menit. Silakan coba      │  ┊                             ┊",
        "  │ sendiri sekarang.            │  ┊      [ ASET-14A ]           ┊",
        "  │ 15pt Sora Bold               │  ┊      QR  ·  2,60\" × 2,60\"   ┊",
        "  │                              │  ┊      L8,74\" · T1,20\"        ┊",
        "  │ Coba aplikasinya:            │  ┊                             ┊",
        "  │   [URL DEMO]                 │  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "  │ Video demo:                  │   [URL DEMO] ditulis di bawah QR",
        "  │   [LINK VIDEO YOUTUBE]       │   13pt JetBrains Mono --text-main",
        "  │ Repository:                  │",
        "  │   [LINK REPOSITORY]          │  ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┐ ┌┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "  │   JetBrains Mono 11pt        │  ┊ [ASET-14B]  ┊ ┊[ASET-14C]  ┊",
        "  │                              │  ┊ 1,60×3,00\"  ┊ ┊1,20×1,20\"  ┊",
        "  │ Alur singkat untuk juri:     │  ┊ potret       ┊ ┊ opsional   ┊",
        "  │ Daftar → Atur ruang →        │  └┄┄┄┄┄┄┄┄┄┄┄┄┄┘ └┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "  │ Check-in → Jejak → \"Cari     │   L7,20\" T4,20\"  L9,40\" T5,40\"",
        "  │ pola baru\" → Ruang           │",
        "  │                              │   Latar ivory polos · satu aksen",
        "  │ Akun demo: [AKUN DEMO]       │   plum · tanpa elemen yang bersaing",
        "  └──────────────────────────────┘",
    ],
    "aset": [
        ("14A", "Kode QR menuju demo — **wajib**", "L 8,74\" · T 1,20\"", "2,60\" × 2,60\"", "1 : 1"),
        ("14B", "Bidang pendamping potret", "L 7,20\" · T 4,20\"", "1,60\" × 3,00\"", "1 : 1,88"),
        ("14C", "Penanda kecil — opsional", "L 9,40\" · T 5,40\"", "1,20\" × 1,20\"", "1 : 1"),
    ],
    "token": "`--background` polos · QR hitam murni di atas `--surface` (kontras maksimum "
             "untuk pemindaian — jangan diberi warna merek) · `--primary` hanya pada "
             "satu aksen · tanpa `--accent`",
    "type": "URL selalu JetBrains Mono dan ditulis lengkap di bawah QR — penonton lewat "
            "layar bagikan sering tidak bisa memindai.",
}


def plum_field(rows: list[str], inner: int = 64) -> list[str]:
    """The closing slide is the one full-bleed plum field; draw it as solid ink."""
    edge = " " + "█" * (inner + 6)
    return [edge] + [" ███" + row.ljust(inner) + "███" for row in rows] + [edge]


UI[15] = {
    "layout": "`title-centered` (index 2) — latar diganti penuh plum oleh `build_closing()`",
    "art": plum_field([
        "",
        "  Kanvas penuh --primary #5B3A52 · tanpa nomor slide",
        "",
        "",
        "         Kamu tidak harus selalu",
        "         baik-baik saja.",
        "         ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔",
        "         44pt Sora · --background #FAF8F4 · rata tengah",
        "         T2,15\" · h1,70\"",
        "",
        "         Dan kamu tidak perlu menunggu sampai terasa",
        "         terlalu berat untuk mulai memperhatikan.",
        "",
        "",
        "                                     ┌┄┄┄┄┄┄┄┄┄┄┄┄┄┐",
        "                                     ┊ [ASET-15A]  ┊",
        "  Terima kasih · Tim CH ·            ┊ tinggi 2,3\" ┊",
        "  MindCraft Web Competition 2026     ┊ tanpa kartu ┊",
        "  Kontak: [KONTAK TIM]               ┊ L9,93 T4,65 ┊",
        "  12,5pt Plus Jakarta Sans · ivory   └┄┄┄┄┄┄┄┄┄┄┄┄┄┘",
        "",
    ]) + [
        "  Kontras ivory di atas plum = 9,1 : 1 (AAA) — pembalikan penuh dari cover",
    ],
    "aset": [
        ("15A", "Penanda penutup di atas bidang plum", "L 9,93\" · T 4,65\"", "tinggi 2,3\"", "bebas"),
    ],
    "token": "Satu-satunya slide yang membalik seluruh palet: `--primary` menjadi "
             "kanvas, `--background` menjadi teks. Slot 15A dipasang **tanpa kartu** "
             "dan butuh latar transparan — kartu putih akan merobek bidang plum.",
    "type": "44pt Sora rata tengah sebagai satu-satunya elemen besar; kredit 12,5pt "
            "Plus Jakarta Sans di kaki. Tidak ada tingkat ketiga.",
}


# --------------------------------------------------------------------------- #
# spoken track
# --------------------------------------------------------------------------- #
#
# Ditulis sebagai orang pertama — Yogawan, mewakili Tim CH — untuk babak final
# yang durasinya maksimal 15 menit (Guidebook bab 8). Anggarannya sengaja
# disetel 13:40 supaya masih ada sekitar satu menit dua puluh detik cadangan
# untuk demo yang melambat atau juri yang menyela.

NASKAH = {
    1: {
        "detik": 30,
        "naskah": [
            "\"Selamat pagi, Bapak dan Ibu juri. Perkenalkan, saya Yogawan, "
            "mewakili Tim CH.\"",
            "\"Sebelum masuk ke produknya, saya mau minta sepuluh detik. Coba "
            "diingat — kapan terakhir Bapak atau Ibu sadar sedang kelelahan? "
            "Biasanya bukan waktu lelahnya. Biasanya waktu sudah kelewat.\"",
            "\"Itu yang kami kerjakan. Karya kami namanya RuangPijar — ruang "
            "kecil untuk memahami dirimu. Empat langkah: Reflect, Record, "
            "Understand, Act. Saya mulai dari kenapa ini perlu ada.\"",
        ],
        "panggung": "Biarkan pertanyaan di paragraf kedua menggantung dua detik "
                    "sebelum menyebut nama produk. Jangan buru-buru klik.",
    },
    2: {
        "detik": 70,
        "naskah": [
            "\"Kita mulai dari masalahnya.\"",
            "\"Kehidupan kuliah menumpuk dari tiga arah sekaligus. Akademik — "
            "tugas dan tenggat yang saling menimpa. Keseharian — tidur yang "
            "berantakan berhari-hari. Dan hal-hal personal, yang biasanya "
            "disimpan sendiri.\"",
            "\"Ini bukan asumsi kami. Guidebook lomba ini sendiri menyebut "
            "tuntutan akademik, sosial, dan pribadi, dan akses ke layanan "
            "konvensional yang masih punya hambatan.\"",
            "\"Yang menarik, Lattie dan tim di tahun 2019 meninjau delapan "
            "puluh sembilan penelitian intervensi kesehatan mental digital "
            "untuk mahasiswa. Delapan puluh persen lewat website, dan sebagian "
            "besar terbukti efektif. Tapi ada catatannya: yang menentukan "
            "justru usability dan pengalaman penggunanya. Jadi medianya sudah "
            "terbukti — tinggal eksekusinya.\"",
            "\"Cuma, ada satu celah. Kebanyakan solusi menolong ketika "
            "kondisinya sudah berat. Belum banyak yang membantu melihat "
            "kondisi harian sebagai pola, sebelum menumpuk.\"",
            "\"Dan biar saya jujur di depan: kami belum punya data prevalensi "
            "di kampus kami sendiri. Itu PR kami berikutnya.\"",
            "\"RuangPijar hadir untuk membantu melihatnya lebih awal.\"",
        ],
        "panggung": "Sebut angka \"80%\" pelan dan beri jeda — itu satu-satunya "
                    "angka riset di slide ini, jangan tenggelam. Akui gap data "
                    "dengan tenang; juri lebih menghargai itu daripada klaim kosong.",
    },
    3: {
        "detik": 55,
        "naskah": [
            "\"Jadi, RuangPijar itu apa?\"",
            "\"Sederhananya: jurnal harian berbasis web yang mengubah catatan "
            "kecil dari keseharian jadi gambaran yang lebih mudah dipahami. "
            "Tanpa diagnosis, tanpa label.\"",
            "\"Ada tiga hal yang kami jaga. Pertama, rasanya seperti "
            "percakapan, bukan kuesioner klinis — lima langkah pendek, boleh "
            "dilewati, tidak ada jawaban yang salah.\"",
            "\"Kedua, polanya datang dari data pengguna sendiri. Bukan dari "
            "asumsi tentang orang lain.\"",
            "\"Ketiga — dan ini yang paling penting buat kami — setiap "
            "pemahaman berujung pada satu langkah kecil yang bisa dikerjakan "
            "hari itu juga. Tahu saja tidak cukup.\"",
            "\"Semuanya ada di empat halaman: Check-In, Jejak, Insight, dan "
            "Ruang. Saya bahas satu-satu, tapi sebelum itu, saya mau "
            "tunjukkan kenapa keempatnya harus saling menyambung.\"",
        ],
        "panggung": "Tekankan kata \"percakapan\" dan \"langkah kecil\" — dua kata "
                    "itu yang membedakan kita dari aplikasi mood tracker biasa.",
    },
    4: {
        "detik": 55,
        "naskah": [
            "\"Ini konsepnya. Mencatat saja tidak cukup — lingkarannya harus "
            "ditutup.\"",
            "\"Masalah pertama: kondisi harian tidak terbaca. Jawabannya "
            "Check-In — dua menit untuk membuat perasaan jadi sesuatu yang "
            "bisa dicatat.\"",
            "\"Masalah kedua: satu hari tidak bercerita apa-apa. Jawabannya "
            "Jejak — hari-hari itu dikumpulkan jadi satu rentang yang bisa "
            "dilihat.\"",
            "\"Masalah ketiga: pola tidak muncul sendiri. Jawabannya Insight — "
            "membaca keterkaitan antar-catatan, dan selalu menampilkan "
            "dasarnya.\"",
            "\"Masalah keempat: tahu saja tidak mengubah apa pun. Jawabannya "
            "Ruang — satu langkah kecil yang relevan hari ini.\"",
            "\"Dan perhatikan panahnya, Pak, Bu — dari Ruang balik lagi ke "
            "Check-In. Ini lingkaran, bukan garis lurus. Latihan yang "
            "dijalani hari ini jadi bahan catatan besok.\"",
        ],
        "panggung": "Ikuti panah dengan tangan atau kursor saat menyebut tiap "
                    "fase. Paragraf terakhir adalah poin argumennya — pelankan.",
    },
    5: {
        "detik": 65,
        "naskah": [
            "\"Kita masuk ke fitur pertama: Check-In.\"",
            "\"Lima langkah pendek. Mood dipilih lewat lima wajah — Berat, "
            "Rendah, Biasa, Baik, Sangat baik. Energi dan stres pakai skala "
            "satu sampai sepuluh yang tinggal digeser.\"",
            "\"Lalu jam tidur, beban akademik, beban sosial. Ini opsional. Dan "
            "ini penting: kalau dikosongkan, artinya tidak dijawab — bukan "
            "nol. Beda, dan bedanya kami jaga sampai ke basis data.\"",
            "\"Terakhir, faktor pemicu dari sembilan pilihan, plus ruang "
            "refleksi bebas sampai dua ribu karakter.\"",
            "\"Setiap check-in menghidupkan streak harian. Dan sebelum "
            "streak-nya hangus, kami kirim pengingat lewat email — supaya "
            "kebiasaannya tidak putus cuma karena lupa.\"",
            "\"Totalnya sekitar dua menit. Itu memang targetnya: cukup pendek "
            "untuk dilakukan tiap hari, cukup lengkap untuk jadi data.\"",
        ],
        "panggung": "Paragraf soal \"dikosongkan bukan nol\" biasanya memancing "
                    "pertanyaan juri. Siapkan jawabannya: nilainya disimpan null, "
                    "dan perhitungan insight melewatkannya, bukan menghitungnya nol.",
    },
    6: {
        "detik": 50,
        "naskah": [
            "\"Fitur kedua: Jejak.\"",
            "\"Satu hari terasa biasa. Sebulan mulai bercerita.\"",
            "\"Ada kalender bulanan — hari yang sudah diisi tampil berwarna, "
            "jadi sebulan terbaca dalam satu layar. Ketuk tanggalnya, "
            "check-in hari itu terbuka utuh, lengkap dengan angka dan "
            "refleksinya.\"",
            "\"Dan catatan lama masih bisa disunting. Ini keputusan yang "
            "sengaja kami ambil — jejak itu bukan arsip yang terkunci. Kadang "
            "kita baru paham apa yang terjadi beberapa hari setelahnya.\"",
            "\"Di kolom sebelah ada Latihan dan Insight: latihan yang sudah "
            "dijalani, dan pola yang ditemukan. Terbaru lebih dulu.\"",
        ],
        "panggung": "Kalau demo langsung jalan, buka satu tanggal di sini — "
                    "interaksi ketuk lebih meyakinkan daripada dijelaskan.",
    },
    7: {
        "detik": 80,
        "naskah": [
            "\"Nah, ini bagian yang paling kami banggakan. Insight.\"",
            "\"Ada tiga jenis. Keterkaitan — hubungan antara jam tidur dan "
            "tingkat stres. Tren — arah pergerakan mood, stres, dan energi "
            "dalam empat belas hari terakhir. Dan Pola — faktor yang paling "
            "sering muncul, dan seberapa besar porsinya.\"",
            "\"Tapi yang penting bukan jenisnya. Yang penting: setiap kartu "
            "menyebutkan metriknya, rentang periodenya, dan tingkat "
            "keyakinannya.\"",
            "\"Coba lihat kartu ini. Jenisnya Keterkaitan. Metriknya r sama "
            "dengan minus nol koma enam dua. Periodenya empat belas hari "
            "terakhir, dari sebelas check-in. Keyakinannya tujuh puluh "
            "delapan persen.\"",
            "\"Jadi pengguna tahu persis insight itu datang dari mana. Bukan "
            "kalimat yang tiba-tiba muncul dan minta dipercaya.\"",
            "\"Satu lagi, dan ini keputusan desain yang sengaja: insight tidak "
            "pernah muncul diam-diam. Pengguna sendiri yang menekan tombol "
            "‘Cari pola baru’. Kalau datanya belum cukup, aplikasinya "
            "bilang apa adanya — ‘belum cukup data’ — bukan mengarang "
            "sesuatu supaya layarnya tidak kosong.\"",
            "\"Dan di bawah, selalu ada satu baris: bukan diagnosis.\"",
        ],
        "panggung": "Ini slide dengan bobot argumen tertinggi (Inovasi & "
                    "Relevansi 40%). Jangan terburu-buru. Bacakan angka kartu "
                    "anatomi satu per satu sambil menunjuk bagiannya.",
    },
    8: {
        "detik": 55,
        "naskah": [
            "\"Fitur terakhir: Ruang.\"",
            "\"Tidak harus melakukan semuanya. Cukup satu hal kecil hari ini.\"",
            "\"Tab ‘Untuk kamu’ membaca lima check-in terakhir, mengambil "
            "faktor yang paling sering muncul, lalu mencocokkannya dengan "
            "latihan yang relevan. Ada enam kategori kalau mau ditelusuri "
            "sendiri — Refleksi, Napas, Pemulihan, Perencanaan, Belajar, dan "
            "Dukungan.\"",
            "\"Setiap latihan menampilkan jenis dan perkiraan durasinya "
            "sebelum dimulai. Tidak ada komitmen yang mengagetkan.\"",
            "\"Dan ini yang penting: Mulai, lalu Selesai atau Lewati. Keduanya "
            "tercatat. Dan keduanya sama-sama tidak apa-apa — kami sengaja "
            "tidak menghukum orang yang melewati.\"",
            "\"Alasan sarannya juga ditulis terbuka di layar: ‘Disarankan "
            "dari check-in terakhirmu: Akademik, Tidur.’ Tidak ada kotak "
            "hitam.\"",
        ],
        "panggung": "Kalimat \"keduanya sama-sama tidak apa-apa\" adalah nada "
                    "produknya. Ucapkan pelan, jangan seperti membaca fitur.",
    },
    9: {
        "detik": 40,
        "naskah": [
            "\"Mari saya rangkai jadi satu cerita.\"",
            "\"Malam ini, dua menit di Check-In. Mood, energi, stres, dan "
            "faktor hari itu tersimpan.\"",
            "\"Saat itu juga, Jejak bertambah satu hari.\"",
            "\"Setelah beberapa hari, pengguna menekan ‘Cari pola baru’, "
            "dan Insight mulai menemukan keterkaitan.\"",
            "\"Hari berikutnya, Ruang menyesuaikan sarannya dengan faktor yang "
            "paling sering muncul.\"",
            "\"Lalu latihan yang dijalani tercatat lagi di Jejak — dan "
            "lingkarannya menutup sendiri. Tidak ada fitur yang berdiri "
            "sendiri di sini.\"",
        ],
        "panggung": "Slide cepat. Jaga ritme — satu tahap satu tarikan napas, "
                    "lalu tutup dengan kalimat terakhir agak melambat.",
    },
    10: {
        "detik": 55,
        "naskah": [
            "\"Sekarang sisi teknisnya.\"",
            "\"Kami pakai Next.js 16 dengan App Router, React 19, TypeScript, "
            "dan Tailwind versi 4. Yang agak beda: App Router-nya kami pakai "
            "sekaligus sebagai antarmuka dan sebagai BFF — backend for "
            "frontend. Jadi tidak ada server terpisah yang sebenarnya tidak "
            "kami butuhkan.\"",
            "\"Route Handler-nya menangani check-ins, jejak, insights, "
            "actions, action-logs, personalization, upload, dan cron.\"",
            "\"Datanya di MongoDB lewat Mongoose, enam model. Autentikasinya "
            "Auth.js versi 5 berbasis JWT — Google OAuth dan email-password, "
            "dengan hash bcrypt yang tidak pernah ikut terbaca dari query.\"",
            "\"Ditambah Cloudinary untuk foto profil, Nodemailer untuk email "
            "streak, dan Vercel Cron yang menyapu tiap jam satu pagi.\"",
            "\"Dan spesifikasi API-nya bisa langsung dibuka di /docs. Silakan "
            "diperiksa.\"",
        ],
        "panggung": "Ini satu-satunya slide (bersama 11) yang boleh menyebut "
                    "path. Kalimat terakhir adalah undangan — ucapkan seperti "
                    "menantang juri untuk mengecek, bukan seperti menutup bab.",
    },
    11: {
        "detik": 80,
        "naskah": [
            "\"Dan ini cara kerjanya, dari satu check-in sampai jadi satu "
            "pola. Saya jelaskan sampai angkanya, supaya bisa diperiksa.\"",
            "\"Input. Form check-in dikirim ke POST /api/check-ins. Sesinya "
            "diverifikasi, catatannya disimpan terikat pada userId, streak-nya "
            "diperbarui.\"",
            "\"Processing. Ini hanya jalan kalau pengguna menekan ‘Cari pola "
            "baru’. Sistem mengambil check-in empat belas hari terakhir, "
            "minimal tiga catatan, lalu menjalankan tiga aturan.\"",
            "\"Tren: selisih rata-rata paruh awal dibanding paruh akhir, untuk "
            "mood, stres, atau energi — ambangnya nol koma tujuh lima.\"",
            "\"Keterkaitan: korelasi Pearson antara jam tidur dan stres, "
            "ambangnya nilai mutlak r lebih besar sama dengan nol koma empat.\"",
            "\"Pola: satu faktor muncul di minimal empat puluh persen check-in "
            "dalam rentang itu.\"",
            "\"Output. Kandidat yang lolos disimpan beserta metrik, periode, "
            "dan nilai keyakinannya, lalu tampil sebagai kartu di Insight.\"",
            "\"Kalau tidak ada yang lolos ambang? Sistemnya menjawab jujur: "
            "belum cukup data untuk membuat insight baru.\"",
            "\"Jadi seluruhnya deterministik. Data yang sama menghasilkan "
            "insight yang sama, dan tidak ada model black-box di mana pun.\"",
        ],
        "panggung": "Slide terpenting untuk Fungsionalitas (30%). Sebutkan "
                    "ketiga ambang angka dengan jelas — itu bukti klaim "
                    "\"bisa ditelusuri\". Antisipasi pertanyaan: kenapa Pearson, "
                    "kenapa 14 hari, kenapa minimal 3 catatan.",
    },
    12: {
        "detik": 35,
        "naskah": [
            "\"Singkat soal metodologi.\"",
            "\"Kami kerjakan bertahap. Identifikasi — studi literatur dan "
            "guidebook, lalu perumusan masalah pengguna. Perancangan — alur "
            "produk, sistem desain, skema data, dan kontrak API.\"",
            "\"Pengembangan — frontend, BFF, basis data, lalu integrasi "
            "layanan pendukung. Dan pengujian — uji fungsional tiap endpoint, "
            "uji aturan insight, dan uji aksesibilitas.\"",
            "\"Pengujian selalu jadi penutup tiap siklus, bukan sesuatu yang "
            "ditempel di akhir.\"",
        ],
        "panggung": "Slide transisi. Cepat dan rapi — jangan habiskan waktu di "
                    "sini, waktunya dibutuhkan di slide 13 dan demo.",
    },
    13: {
        "detik": 65,
        "naskah": [
            "\"Jadi, apa nilai tambah RuangPijar? Menurut kami bukan yang "
            "paling pintar — tapi yang paling bisa dipercaya.\"",
            "\"Dari sisi inovasi: setiap insight menyebut metrik, periode, dan "
            "keyakinannya, dan aturannya bisa dijelaskan kalimat per kalimat. "
            "Lalu kendalinya di tangan pengguna — pola hanya dicari kalau "
            "diminta.\"",
            "\"Dari sisi UI/UX: kami membangun ruang, bukan dashboard. "
            "Paletnya tenang — ivory, plum, peach, sage. Tipografinya Sora dan "
            "Plus Jakarta Sans. Dan ada maskot yang memandu lewat tur di tiap "
            "halaman, yang bisa diputar ulang kapan saja dari Profil.\"",
            "\"Soal inklusivitas, tiga hal yang kami jaga: warna tidak pernah "
            "jadi penanda tunggal — selalu ada wajah, label, dan warna "
            "sekaligus. Indikator fokus keyboard ada di seluruh aplikasi. Dan "
            "kami menghormati prefers-reduced-motion.\"",
            "\"Soal privasi: tiap endpoint memeriksa sesi sebelum menjawab, "
            "seluruh query terikat userId, dan kata sandinya hash yang tidak "
            "ikut terbaca.\"",
            "\"Dan etikanya kami nyatakan langsung di produk: ini refleksi, "
            "bukan pengganti tenaga profesional.\"",
            "\"Satu hal lagi yang perlu saya sampaikan terbuka — kami belum "
            "sempat menjalankan uji pengguna formal. Jadi klaim dampak kami "
            "masih berupa potensi, bukan temuan.\"",
        ],
        "panggung": "Slide ini memikul dua kriteria sekaligus (Inovasi 40% + "
                    "UI/UX 15%). Tunjuk strip palet dan pasangan tipografi saat "
                    "menyebutnya — di sini kita menunjukkan, bukan mengklaim. "
                    "Tutup dengan pengakuan soal uji pengguna; jangan dilewati.",
    },
    14: {
        "detik": 55,
        "naskah": [
            "\"Dan cara tercepat memahami RuangPijar bukan dengan mendengarkan "
            "saya — tapi dengan mengisi satu check-in.\"",
            "\"Ada QR di layar, dan URL-nya saya tulis di bawahnya buat yang "
            "menonton lewat layar bagikan. Link video demo dan repository-nya "
            "juga ada di sini.\"",
            "\"Kalau Bapak Ibu mau mencoba sendiri nanti, alurnya: Daftar, "
            "atur ruang, Check-In, lihat Jejak, tekan ‘Cari pola baru’, "
            "lalu buka Ruang. Sekitar tiga menit.\"",
            "\"Kami juga siapkan akun demo yang sudah ada riwayat check-in-nya, "
            "supaya Insight-nya langsung punya cukup data untuk dibaca.\"",
            "\"Saya tunjukkan sebentar.\"",
        ],
        "panggung": "Kalau demo langsung dijalankan, ambil dari akun demo yang "
                    "sudah berisi — jangan daftar dari nol di depan juri, "
                    "Insight-nya akan kosong dan justru melemahkan slide 7. "
                    "Sisakan waktu; demo ini di luar anggaran 13:40.",
    },
    15: {
        "detik": 30,
        "naskah": [
            "\"Saya tutup.\"",
            "\"Kita mulai presentasi ini dari satu masalah: kondisi diri "
            "sering baru terbaca setelah terlambat.\"",
            "\"RuangPijar menjawabnya dengan hal paling sederhana yang bisa "
            "dilakukan hari ini — dua menit untuk berhenti, mencatat, dan "
            "memahami. Tidak ada diagnosis. Tidak ada label. Hanya data dari "
            "pengalamanmu sendiri.\"",
            "\"Kamu tidak harus selalu baik-baik saja. Dan kamu tidak perlu "
            "menunggu sampai terasa terlalu berat untuk mulai memperhatikan.\"",
            "\"Terima kasih, Bapak dan Ibu juri. Saya Yogawan, dari Tim CH. "
            "Kami siap menerima pertanyaan.\"",
        ],
        "panggung": "Jangan menambah apa pun setelah \"siap menerima "
                    "pertanyaan\". Diam, dan biarkan slide plum-nya bekerja.",
    },
}

for _n, _v in NASKAH.items():
    UI[_n].update(_v)


# --------------------------------------------------------------------------- #
# assembly
# --------------------------------------------------------------------------- #

def aset_manifest() -> str:
    rows = []
    for number in sorted(UI):
        for slot, isi, pos, size, ratio in UI[number]["aset"]:
            rows.append(
                f"| `ASET-{slot}` | {number} | {isi} | {pos} | {size} | {ratio} |"
            )
    bare = sorted(n for n in UI if not UI[n]["aset"])
    intro = (
        f"**{len(rows)} slot** tersebar di {len(UI) - len(bare)} slide. "
        f"Slide {', '.join(map(str, bare))} tidak punya slot sama sekali — "
        "seluruhnya teks dan shape.\n\n"
        "Kolom \"Isi\" hanya menyebut peran yang dilayani slot itu di dalam argumen "
        "slide; itu bukan perintah soal gambarnya.\n\n"
    )
    return ASET_NOTE + intro + ASET_TABLE_HEAD + "\n".join(rows) + "\n"


def clock(seconds: int) -> str:
    return f"{seconds // 60}:{seconds % 60:02d}"


JUDUL = {
    1: "Cover", 2: "Latar Belakang & Urgensi", 3: "Pengenalan Platform",
    4: "Konsep & Pendekatan Solusi", 5: "Check-In", 6: "Jejak", 7: "Insight",
    8: "Ruang", 9: "Alur Pengguna End-to-End", 10: "Arsitektur Teknologi",
    11: "Cara Kerja Sistem", 12: "Metodologi Riset",
    13: "Nilai Tambah, UI/UX & Dampak", 14: "Live Demo", 15: "Closing",
}

LIMIT = 15 * 60


def naskah_overview() -> str:
    """Time budget for the final round, generated from the per-slide seconds."""
    rows, elapsed = [], 0
    for number in sorted(UI):
        elapsed += UI[number]["detik"]
        rows.append(
            f"| {number} | {JUDUL[number]} | {clock(UI[number]['detik'])} | "
            f"{clock(elapsed)} |"
        )
    sisa = LIMIT - elapsed
    return (
        "## Naskah & Anggaran Waktu\n\n"
        "Tiap slide di bawah punya bagian **`### Naskah Presentasi`** — kalimat "
        "yang benar-benar diucapkan, ditulis sebagai orang pertama, plus catatan "
        "panggung untuk hal yang tidak bisa dibaca dari slide.\n\n"
        f"Babak final memberi waktu **maksimal 15 menit** presentasi dan 10 menit "
        f"tanya jawab *(Guidebook bab 8)*. Naskah ini dianggarkan "
        f"**{clock(elapsed)}** — menyisakan **{clock(sisa)}** sebagai cadangan "
        "untuk demo yang melambat, juri yang menyela, atau napas yang perlu "
        "diambil. Demo langsung di slide 14 berada **di luar** anggaran ini.\n\n"
        "| Slide | Isi | Slot | Kumulatif |\n"
        "| --- | --- | --- | --- |\n"
        + "\n".join(rows)
        + f"\n| | **Total** | **{clock(elapsed)}** | **cadangan {clock(sisa)}** |\n\n"
        "Tiga slide memegang bobot penilaian terbesar dan sengaja diberi slot "
        "paling panjang: **slide 7 (Insight)** dan **slide 11 (Cara Kerja "
        "Sistem)** masing-masing 1:20, lalu **slide 13** 1:05. Kalau waktu "
        "mepet, yang dipotong adalah slide 12 dan 9 — bukan ketiganya.\n"
    )


def naskah_section(number: int) -> str:
    """The spoken track for one slide, with its slot in the 15-minute budget."""
    meta = UI[number]
    elapsed = sum(UI[n]["detik"] for n in sorted(UI) if n <= number)
    lines = [
        "### Naskah Presentasi\n",
        f"**Slot waktu:** {clock(meta['detik'])} · "
        f"**selesai slide ini di menit {clock(elapsed)}** dari 15:00\n",
    ]
    lines += [f"> {para}\n" for para in meta["naskah"]]
    if meta.get("panggung"):
        lines.append(f"*Panggung: {meta['panggung']}*\n")
    return "\n".join(lines)


def build_section(number: int) -> str:
    meta = UI[number]
    parts = [
        "### Gambaran UI\n",
        f"**Layout PPTX:** {meta['layout']}\n",
        f"{frame(meta['art'])}\n",
    ]
    if meta["aset"]:
        slots = " · ".join(
            f"`ASET-{slot}` {size}" for slot, _, _, size, _ in meta["aset"]
        )
        parts.append(
            f"**Aset (kosong — disediakan manual):** {slots}\n"
        )
    else:
        parts.append(
            "**Aset:** tidak ada — slide ini seluruhnya teks dan shape.\n"
        )
    parts.append(f"**Token:** {meta['token']}\n")
    parts.append(f"**Tipografi:** {meta['type']}\n")
    parts.append(naskah_section(number))
    return "\n".join(parts)


SLIDE_HEAD = re.compile(r"^# Slide \d+", re.M)
GAMBARAN = re.compile(r"\n### Gambaran UI\n.*?(?=\n### |\n---\n|\Z)", re.S)


def main() -> None:
    text = BLUEPRINT.read_text(encoding="utf-8")

    # Re-runnable: drop a previous preamble and any previous UI sections.
    first = SLIDE_HEAD.search(text)
    if first is None:
        raise SystemExit("no slides found in blueprint")
    text = text[first.start():]
    text = GAMBARAN.sub("", text)

    blocks = []
    starts = [m.start() for m in SLIDE_HEAD.finditer(text)] + [len(text)]
    for begin, end in zip(starts, starts[1:]):
        block = text[begin:end]
        number = int(re.match(r"^# Slide (\d+)", block).group(1))
        body = block.rstrip()
        trailing = ""
        if body.endswith("---"):
            body = body[: -len("---")].rstrip()
            trailing = "\n\n---\n"
        blocks.append(f"{body}\n\n{build_section(number).rstrip()}{trailing}")

    preamble = (PREAMBLE_HEAD + "\n" + aset_manifest()
                + "\n" + naskah_overview() + "\n---\n")
    BLUEPRINT.write_text(preamble + "\n" + "\n".join(blocks).rstrip() + "\n",
                         encoding="utf-8")
    slots = sum(len(UI[n]["aset"]) for n in UI)
    print(f"Wrote {BLUEPRINT.name}: preamble + {len(blocks)} UI sections, "
          f"{slots} empty asset slots")


if __name__ == "__main__":
    main()
