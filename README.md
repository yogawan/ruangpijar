This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# 🎨 RuangPijar — UI Design Tokens

> **Design Direction:** *A quiet digital room, not a medical dashboard.*
>
> RuangPijar menggunakan visual yang **warm, calm, intimate, editorial, dan human**. Interface harus terasa seperti ruang pribadi untuk refleksi, bukan aplikasi klinis atau SaaS dashboard.

---

## 1. Design Principles

### 1.1 Calm

Interface tidak boleh terasa agresif atau overwhelming.

* Banyak whitespace
* Animasi subtle
* Warna muted
* Tidak menggunakan terlalu banyak visual sekaligus

### 1.2 Human

RuangPijar berhubungan dengan pengalaman personal.

* Typography editorial
* Copywriting conversational
* Penggunaan ilustrasi/emoji secara terbatas
* Hindari bahasa klinis

### 1.3 Private

User harus merasa data mereka aman.

* Privacy menjadi bagian dari UI
* Gunakan visual `Lock`, `Shield`, dan privacy indicator
* Jangan menggunakan visual yang terasa seperti monitoring

### 1.4 Accessible

Warna bukan satu-satunya cara menyampaikan informasi.

Contoh:

```text
❌ Merah = kondisi buruk
✅ 😣 + "Berat" + warna muted
```

---

# 2. Color Tokens

## 2.1 Primitive Colors

```ts
const colors = {
  // Neutrals
  ivory: "#FAF8F4",
  white: "#FFFFFF",
  ink: "#292525",
  muted: "#746E6A",
  subtle: "#A8A19B",
  border: "#E8E2DC",

  // Brand
  plum: "#5B3A52",
  plumDark: "#432B3D",
  plumSoft: "#EEE5EC",

  // Warm Accent
  peach: "#E9A68D",
  peachSoft: "#F8E7DF",

  // Secondary
  sage: "#8FA58D",
  sageSoft: "#E7EFE5",

  // Semantic
  success: "#668B6B",
  warning: "#C18A4A",
  danger: "#B96A6A",
  info: "#71899A",
};
```

---

# 3. Semantic Color Tokens

Komponen UI **tidak boleh langsung menggunakan primitive hex color**.

Gunakan semantic token.

```ts
const semanticColors = {
  background: {
    primary: "var(--color-ivory)",
    secondary: "var(--color-peach-soft)",
  },

  surface: {
    default: "var(--color-white)",
    elevated: "var(--color-white)",
    muted: "var(--color-plum-soft)",
  },

  text: {
    primary: "var(--color-ink)",
    secondary: "var(--color-muted)",
    tertiary: "var(--color-subtle)",
    inverse: "var(--color-white)",
  },

  brand: {
    primary: "var(--color-plum)",
    hover: "var(--color-plum-dark)",
    subtle: "var(--color-plum-soft)",
  },

  accent: {
    primary: "var(--color-peach)",
    subtle: "var(--color-peach-soft)",
  },

  secondary: {
    primary: "var(--color-sage)",
    subtle: "var(--color-sage-soft)",
  },

  border: {
    default: "var(--color-border)",
  },

  feedback: {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
    info: "var(--color-info)",
  },
};
```

---

# 4. Core Palette

Untuk mayoritas UI, cukup gunakan:

| Token                | Value     | Usage                 |
| -------------------- | --------- | --------------------- |
| `background-primary` | `#FAF8F4` | Main page background  |
| `surface-default`    | `#FFFFFF` | Card / panel          |
| `text-primary`       | `#292525` | Heading & body        |
| `text-secondary`     | `#746E6A` | Supporting text       |
| `brand-primary`      | `#5B3A52` | CTA / active state    |
| `brand-subtle`       | `#EEE5EC` | Soft brand background |
| `accent-primary`     | `#E9A68D` | Highlight             |
| `secondary-primary`  | `#8FA58D` | Supporting accent     |
| `border-default`     | `#E8E2DC` | Borders / dividers    |

**Rule:**

> Jangan menggunakan semua warna sekaligus dalam satu section.

Core visual harus tetap didominasi **ivory + plum + white**.

---

# 5. Mood Tokens

Mood menggunakan warna sebagai **secondary visual cue**, bukan sebagai indikator utama.

```ts
const moodColors = {
  heavy: "#C98585",
  low: "#C7A08F",
  neutral: "#B6AA91",
  good: "#94A78F",
  great: "#7E9C82",
};
```

Mapping:

| Mood | Label   | Visual |
| ---- | ------- | ------ |
| `1`  | Heavy   | 😣     |
| `2`  | Low     | 😞     |
| `3`  | Neutral | 😐     |
| `4`  | Good    | 🙂     |
| `5`  | Great   | 😄     |

---

# 6. Typography

## Primary Font

**Inter**

Digunakan untuk:

* Body
* Navigation
* Button
* Input
* Label
* Data visualization
* Metadata

## Display Font

**Instrument Serif**

Digunakan untuk:

* Hero
* Large heading
* Emotional statement
* Editorial section heading

---

## Type Scale

```text
Display XL
64px / 1.05

Display
48px / 1.10

H1
40px / 1.15

H2
32px / 1.20

H3
24px / 1.25

Body Large
18px / 1.60

Body
16px / 1.60

Body Small
14px / 1.50

Label
13px / 1.40

Caption
12px / 1.40
```

### Mobile

```text
Display
40px

H1
32px

H2
26px

H3
22px

Body
16px
```

---

# 7. Typography Rules

### Heading

Gunakan Instrument Serif untuk statement yang emosional.

```text
Kenali apa yang
kamu rasakan.
```

### Supporting text

Gunakan Inter.

```text
Ruang privat untuk membantu kamu memahami
pola keseharian yang memengaruhi well-being kamu.
```

### UI

Gunakan Inter Medium.

```text
Mulai Check-in
```

---

# 8. Spacing

Gunakan sistem **4px base unit**.

```ts
const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
  32: "128px",
};
```

### Guidelines

```text
Icon ↔ text
8px

Label ↔ input
8px

Input ↔ input
16px

Card internal padding
24px

Section ↔ section
64–96px

Hero spacing
96–128px
```

---

# 9. Border Radius

```ts
const radius = {
  sm: "10px",
  md: "14px",
  lg: "20px",
  xl: "28px",
  full: "999px",
};
```

### Usage

| Component     |  Radius |
| ------------- | ------: |
| Button        |  `12px` |
| Input         |  `12px` |
| Select        |  `12px` |
| Small Card    |  `14px` |
| Card          |  `20px` |
| Modal         |  `24px` |
| Large Feature |  `28px` |
| Badge / Pill  | `999px` |

---

# 10. Border

Default:

```css
border: 1px solid #E8E2DC;
```

Jangan menggunakan border hitam.

Untuk active state:

```css
border: 1px solid #5B3A52;
```

---

# 11. Shadow

Gunakan shadow dengan sangat hemat.

```css
--shadow-sm:
  0 1px 2px rgba(41, 37, 37, 0.04);

--shadow-md:
  0 8px 24px rgba(41, 37, 37, 0.06);

--shadow-lg:
  0 20px 50px rgba(41, 37, 37, 0.08);
```

Default card:

```text
White
+
1px border
```

Tidak harus memiliki shadow.

---

# 12. Button

## Primary

```text
Background: #5B3A52
Text: #FFFFFF
Radius: 12px
Height: 48px
```

Example:

```text
┌────────────────────────┐
│    Mulai Check-in  →   │
└────────────────────────┘
```

## Secondary

```text
Background: transparent
Border: #E8E2DC
Text: #292525
```

## Ghost

```text
Background: transparent
Text: #5B3A52
```

---

# 13. Input

Default:

```text
Background: #FFFFFF
Border: #E8E2DC
Radius: 12px
Height: 48px
```

Focus:

```text
Border: #5B3A52
```

Error:

```text
Border: #B96A6A
```

---

# 14. Card

Default:

```text
background: #FFFFFF
border: 1px solid #E8E2DC
border-radius: 20px
padding: 24px
```

### Insight Card

Gunakan soft brand background:

```text
background: #EEE5EC
border: none
```

Contoh:

```text
┌──────────────────────────────────┐
│ ✦  Pola yang mulai terlihat      │
│                                  │
│ Akademik tampaknya berkaitan     │
│ dengan tingkat stresmu.          │
│                                  │
│ Lihat insight →                  │
└──────────────────────────────────┘
```

---

# 15. Check-in Component

Check-in harus terasa seperti **conversation**, bukan survey form.

### Mood Selector

```text
Bagaimana perasaanmu hari ini?

😣       😞       😐       🙂       😄
Berat    Rendah   Biasa    Baik     Sangat baik
```

### Selected State

```text
background: #EEE5EC
border: #5B3A52
```

### Scale

```text
Seberapa penuh energimu?

1 ────────●──────── 10
```

---

# 16. Chart

Chart harus terasa ringan.

### Rules

* Rounded line
* Minimal grid
* Tidak menggunakan heavy axis
* Tidak menggunakan terlalu banyak warna
* Tooltip sederhana
* Area fill sangat subtle

Primary chart:

```text
Line: #5B3A52
Area: #EEE5EC
```

---

# 17. Iconography

Gunakan icon yang sederhana dan konsisten.

**Recommended:**

* Lucide Icons
* Stroke-based icons
* 1.5–2px stroke

Contoh:

```text
Heart
Sparkles
Moon
Sun
Activity
BookOpen
Lock
Shield
ArrowRight
CircleCheck
```

Emoji hanya digunakan pada konteks tertentu:

```text
Mood
Factors
Empty states
```

---

# 18. Navigation

Navigation harus sederhana.

```text
┌──────────────────────────────────────────────────┐
│ ✦ RuangPijar                                    │
│                                                  │
│ Check-in   Jejak   Insight   Ruang       👤     │
└──────────────────────────────────────────────────┘
```

Active:

```text
color: #5B3A52
```

Inactive:

```text
color: #746E6A
```

---

# 19. Motion

Animation harus **subtle dan calming**.

```text
Page transition
300ms

Hover
180ms

Button interaction
150ms

Modal
250ms

Chart reveal
600ms
```

Default easing:

```css
ease-out
```

Hindari:

* Bounce berlebihan
* Aggressive scaling
* Flashing
* Excessive parallax
* Animasi yang terus bergerak

---

# 20. Visual Hierarchy

Prioritas visual:

```text
1. Emotional statement
        ↓
2. Primary action
        ↓
3. Important information
        ↓
4. Supporting information
        ↓
5. Metadata
```

Jangan membuat semua elemen terlihat penting.

---

# 21. Overall UI Direction

RuangPijar harus terasa seperti:

```text
Modern Wellness
        +
Personal Journal
        +
Editorial Design
        +
Digital Product
```

Bukan:

```text
Hospital Dashboard
        ❌
SaaS Admin
        ❌
Generic AI Chatbot
        ❌
Corporate Banking UI
        ❌
```

---

# 22. Final Design Token

```ts
export const tokens = {
  colors: {
    background: "#FAF8F4",
    surface: "#FFFFFF",

    text: "#292525",
    textMuted: "#746E6A",
    textSubtle: "#A8A19B",

    primary: "#5B3A52",
    primaryDark: "#432B3D",
    primarySoft: "#EEE5EC",

    accent: "#E9A68D",
    accentSoft: "#F8E7DF",

    secondary: "#8FA58D",
    secondarySoft: "#E7EFE5",

    border: "#E8E2DC",

    success: "#668B6B",
    warning: "#C18A4A",
    danger: "#B96A6A",
    info: "#71899A",
  },

  typography: {
    display: "Instrument Serif",
    body: "Inter",
  },

  radius: {
    sm: "10px",
    md: "14px",
    lg: "20px",
    xl: "28px",
    full: "999px",
  },

  spacing: {
    unit: "4px",
  },

  motion: {
    fast: "150ms",
    normal: "180ms",
    medium: "300ms",
    slow: "600ms",
  },
};
```

## Design mantra

> **RuangPijar should feel like a quiet room you want to return to — not a dashboard you have to manage.**
