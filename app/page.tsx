import { ArrowRight, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NavbarGlobal from "@/components/NavbarGlobal";
import ScrollAnimations from "@/components/ScrollAnimations";
import SplashScreen from "@/components/SplashScreen";

const problemCards = [
  [
    "Akademik",
    "Deadline, tugas, ujian, dan tuntutan untuk terus berkembang.",
    "/01_Akademik.webp",
  ],
  [
    "Keseharian",
    "Tidur, energi, rutinitas, dan waktu untuk beristirahat.",
    "/02_Keseharian.webp",
  ],
  [
    "Sosial & Personal",
    "Hubungan, keluarga, pekerjaan, dan hal-hal yang kita simpan sendiri.",
    "/03_Sosial-Personal.webp",
  ],
];

const steps = [
  [
    "01",
    "Check-in",
    "Apa yang kamu rasakan hari ini?",
    "Ceritakan kondisi harianmu melalui beberapa pertanyaan sederhana tentang mood, energi, stres, tidur, dan aktivitas.",
    "/01_Check-in.webp",
  ],
  [
    "02",
    "Jejak",
    "Lihat perjalananmu.",
    "Setiap check-in menjadi bagian dari jejak keseharianmu. Seiring waktu, perubahan kecil pun dapat terlihat.",
    "/02_Jejak.webp",
  ],
  [
    "03",
    "Insight",
    "Temukan pola yang mungkin terlewat.",
    "RuangPijar membantu menghubungkan berbagai aspek keseharianmu berdasarkan catatanmu sendiri.",
    "/03_Insight.webp",
  ],
  [
    "04",
    "Ruang",
    "Ambil langkah kecil.",
    "Dapatkan rekomendasi aktivitas sederhana yang relevan dengan kondisimu saat ini.",
    "/04_Ruang.webp",
  ],
];

const features = [
  [
    "Daily Check-in",
    "Berhenti sejenak. Cek keadaanmu.",
    "Catat mood, energi, stres, tidur, beban akademik, kondisi sosial, dan apa yang sedang kamu rasakan.",
    "Mulai Check-in",
    "/01_Daily-Check-in.webp",
  ],
  [
    "Jejak Keseharian",
    "Lihat apa yang berubah dari waktu ke waktu.",
    "Pantau perjalanan mood, energi, dan stres melalui visualisasi yang sederhana dan mudah dipahami.",
    "Lihat Contoh Jejak",
    "/02_Jejak-Keseharian.webp",
  ],
  [
    "Personal Insight",
    "Oh, ternyata...",
    "Temukan hubungan dan pola dari catatanmu sendiri, seperti ketika beban akademik meningkat dan energimu berubah.",
    "Lihat Contoh Insight",
    "/03_Personal-Insight.webp",
  ],
  [
    "Ruang untuk Bertindak",
    "Tidak harus melakukan semuanya sekaligus.",
    "Temukan langkah kecil untuk hari ini: ambil jeda, atur ulang tugas, bernapas sejenak, atau mencari dukungan.",
    "Lihat pilihan ruang",
    "/04_Ruang-untuk-Bertindak.webp",
  ],
];

export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <ScrollAnimations waitForSplash />
      {/* Kept outside <main> on purpose: `overflow-hidden` there would make
          this a sticky child of a clipped box and it would stop sticking. */}
      <NavbarGlobal variant="marketing" />

      <main className="overflow-hidden bg-background text-foreground">
        <section
          id="beranda"
          className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28"
        >
          <div>
            <p data-hero-item className="mb-5 text-sm font-semibold text-brand">
              Ruang kecil untuk memahami dirimu.
            </p>
            <h1
              data-hero-item
              className="max-w-3xl font-display text-5xl leading-[1.06] text-foreground sm:text-6xl"
            >
              Kadang, yang kita butuhkan bukan jawaban.{" "}
              <em className="text-brand">Tapi waktu untuk berhenti.</em>
            </h1>
            <p
              data-hero-item
              className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground"
            >
              RuangPijar membantu kamu mencatat kondisi harian, melihat pola
              yang mungkin terlewat, dan menemukan langkah kecil untuk menjaga
              keseharianmu lebih seimbang.
            </p>
            <div data-hero-item className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
              >
                Mulai Check-in{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface-muted"
              >
                Pelajari Cara Kerja{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <p data-hero-item className="mt-5 text-sm text-muted-foreground">
              Gratis <span aria-hidden="true">&#8226;</span> Privat{" "}
              <span aria-hidden="true">&#8226;</span> Hanya butuh sekitar 2
              menit
            </p>
          </div>
          <div data-hero-visual className="relative mx-auto w-full max-w-lg">
            <Image
              src="/hero_image.webp"
              alt="Ilustrasi refleksi diri"
              width={1024}
              height={1024}
              priority
              className="aspect-square w-full rounded-[28px] object-cover"
            />
            {/* Previous CSS check-in illustration, retained as requested.
          <div className="aspect-[4/5] rounded-[28px] border border-border bg-surface p-5 shadow-md">
            <div className="flex h-full flex-col rounded-[20px] bg-surface-muted p-6">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>CHECK-IN HARI INI</span>
                <span>2 menit</span>
              </div>
              <div className="mt-8 rounded-2xl bg-surface p-5">
                <p className="text-sm font-medium">
                  Bagaimana perasaanmu hari ini?
                </p>
                <div className="mt-5 flex justify-between text-center text-2xl">
                  <span>😣</span>
                  <span>😞</span>
                  <span className="rounded-full bg-sage-soft px-2">😐</span>
                  <span>🙂</span>
                  <span>😄</span>
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>Berat</span>
                  <span>Rendah</span>
                  <span>Biasa</span>
                  <span>Baik</span>
                  <span>Baik sekali</span>
                </div>
              </div>
              <div className="mt-auto rounded-2xl bg-brand p-5 text-primary-foreground">
                <p className="text-xs font-semibold uppercase">Catatan kecil</p>
                <p className="mt-2 font-display text-2xl leading-tight">
                  Ada ruang untuk setiap harimu.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-5 rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-sm">
            <span className="mr-2 text-sage">&#10022;</span> Tidurmu lebih baik
            minggu ini
          </div> */}
          </div>
        </section>

        <section className="border-y border-border bg-surface" id="tentang">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <div data-reveal-stagger className="max-w-2xl">
              <p className="text-sm font-semibold text-brand">
                Mengenali sebelum terasa terlalu berat
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                Hari yang terlihat biasa, belum tentu terasa biasa.
              </h2>
              <p className="mt-6 leading-8 text-muted-foreground">
                Tugas menumpuk. Tidur berantakan. Banyak hal yang harus
                dipikirkan. Kadang semuanya terasa baik-baik saja. Kadang tidak.
                Dan sering kali, kita baru menyadarinya ketika semuanya sudah
                terasa terlalu berat.
              </p>
            </div>
            <div
              data-reveal-stagger
              className="mt-12 grid gap-4 md:grid-cols-3"
            >
              {problemCards.map(([title, text, image], index) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      data-count
                      className="font-display text-4xl text-accent"
                    >
                      0{index + 1}
                    </span>
                    <Image
                      src={image}
                      alt=""
                      width={160}
                      height={160}
                      data-parallax
                      className="h-24 w-24 shrink-0 rounded-full object-contain"
                    />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </article>
              ))}
            </div>
            <p data-reveal className="mt-10 text-lg font-semibold text-brand">
              RuangPijar hadir untuk membantu kamu melihatnya lebih awal.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
          <div data-reveal-stagger>
            <p className="text-sm font-semibold text-brand">
              Kenali. Pahami. Jaga.
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Bukan untuk menilai dirimu. Tapi untuk membantumu memahami dirimu.
            </h2>
          </div>
          <div data-reveal className="rounded-2xl bg-brand-subtle p-7 sm:p-9">
            <p className="leading-8 text-muted-foreground">
              RuangPijar mengubah catatan kecil dari keseharianmu menjadi
              gambaran yang lebih mudah dipahami. Dengan check-in sederhana,
              kamu bisa melihat bagaimana mood, energi, stres, tidur, dan
              aktivitas sehari-hari saling berkaitan.
            </p>
            <div className="mt-7 border-t border-brand/15 pt-6 text-lg font-semibold text-brand">
              Tidak ada diagnosis. Tidak ada label.
              <br />
              Hanya data dari pengalamanmu sendiri.
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="bg-peach-subtle">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <div data-reveal-stagger className="max-w-xl">
              <p className="text-sm font-semibold text-brand">Cara kerja</p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                Mulai dari dua menit untuk dirimu sendiri.
              </h2>
            </div>
            <ol
              data-reveal-stagger
              className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4"
            >
              {steps.map(([number, label, title, text, image]) => (
                <li key={label} className="bg-background p-6">
                  <div className="flex items-center justify-between">
                    <span
                      data-count
                      className="font-display text-4xl text-brand"
                    >
                      {number}
                    </span>
                    <Image
                      src={image}
                      alt=""
                      width={160}
                      height={160}
                      data-parallax
                      className="h-24 w-24 rounded-full object-contain"
                    />
                  </div>
                  <p className="mt-6 text-xs font-semibold uppercase text-muted-foreground">
                    {label}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
            <p
              data-reveal
              className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold tracking-wide text-brand"
            >
              <span>Reflect</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Record</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Understand</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Act</span>
            </p>
          </div>
        </section>

        <section
          id="fitur"
          className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28"
        >
          <div data-reveal-stagger className="max-w-2xl">
            <p className="text-sm font-semibold text-brand">
              Dirancang untuk keseharian mahasiswa
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Hal-hal kecil yang membantu kamu lebih mengenal dirimu.
            </h2>
          </div>
          <div data-reveal-stagger className="mt-12 grid gap-4 md:grid-cols-2">
            {features.map(([label, title, text, action, image], index) => (
              <article
                key={label}
                className={`min-h-72 rounded-2xl border border-border p-7 ${index === 1 ? "bg-sage-soft" : index === 2 ? "bg-brand-subtle" : "bg-surface"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-brand">{label}</p>
                  <Image
                    src={image}
                    alt=""
                    width={160}
                    height={160}
                    data-parallax
                    className="h-16 w-16 shrink-0 rounded-full object-contain"
                  />
                </div>
                <h3 className="mt-8 max-w-sm text-2xl font-semibold leading-tight">
                  {title}
                </h3>
                <p className="mt-4 max-w-md leading-7 text-muted-foreground">
                  {text}
                </p>
                <Link
                  href={
                    index === 0
                      ? "/auth/register"
                      : index === 3
                        ? "/ruang"
                        : "/auth/login"
                  }
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
                >
                  {action} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
            <div data-reveal-stagger>
              <p className="text-sm font-semibold text-brand">
                Dari catatan menjadi pemahaman
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                Terkadang, pola baru terlihat setelah kita melihatnya bersama.
              </h2>
              <p className="mt-6 leading-8 text-muted-foreground">
                Satu hari mungkin terasa biasa. Tapi setelah beberapa hari
                mencatat, kamu mungkin mulai melihat hubungan antara berbagai
                hal dalam keseharianmu.
              </p>
              <Link
                href="/auth/register"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
              >
                Lihat bagaimana insight bekerja{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <article
              data-reveal
              className="rounded-2xl bg-brand-subtle p-7 sm:p-9"
            >
              <p className="text-sm font-semibold text-brand">
                Insight minggu ini
              </p>
              <h3 className="mt-6 font-display text-3xl leading-tight">
                Stresmu cenderung meningkat pada hari dengan beban akademik
                tinggi.
              </h3>
              <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-surface/80 p-4 text-sm font-semibold text-brand">
                <span className="flex items-center justify-center gap-1.5">
                  Beban Akademik{" "}
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                <span className="flex items-center justify-center gap-1.5">
                  Stres <TrendingUp className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-6 text-xs leading-5 text-muted-foreground">
                Insight ini berasal dari pola check-in selama periode tertentu
                dan bukan merupakan diagnosis kesehatan mental.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-28">
          <div data-reveal className="rounded-2xl bg-sage-soft p-8 sm:p-11">
            <Image
              src="/Ruangmu-tetap-milikmu.webp"
              alt=""
              width={160}
              height={160}
              data-parallax
              className="h-28 w-28 rounded-full object-contain"
            />
            <p className="mt-16 font-display text-4xl leading-tight">
              Ruangmu tetap milikmu.
            </p>
          </div>
          <div data-reveal-stagger>
            <p className="text-sm font-semibold text-brand">
              Privasi dan keamanan
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Hal yang kamu ceritakan bersifat pribadi.
            </h2>
            <p className="mt-6 leading-8 text-muted-foreground">
              Data check-in dan refleksimu digunakan untuk membantu memberikan
              pengalaman yang lebih personal, bukan untuk memberi diagnosis atau
              label.
            </p>
            <dl className="mt-8 grid gap-5 sm:grid-cols-3">
              <div>
                <Image
                  src="/Privat.webp"
                  alt=""
                  width={160}
                  height={160}
                  className="h-16 w-16 rounded-full object-contain"
                />
                <dt className="mt-3 font-semibold text-brand">Privat</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                  Data keseharianmu diakses melalui akunmu.
                </dd>
              </div>
              <div>
                <Image
                  src="/Transparan.webp"
                  alt=""
                  width={160}
                  height={160}
                  className="h-16 w-16 rounded-full object-contain"
                />
                <dt className="mt-3 font-semibold text-brand">Transparan</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                  Kamu tahu apa yang dicatat dan digunakan.
                </dd>
              </div>
              <div>
                <Image
                  src="/Non-diagnostik.webp"
                  alt=""
                  width={160}
                  height={160}
                  className="h-16 w-16 rounded-full object-contain"
                />
                <dt className="mt-3 font-semibold text-brand">
                  Non-diagnostik
                </dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                  Refleksi, bukan pengganti tenaga profesional.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="bg-brand">
          <div
            data-reveal-stagger
            className="mx-auto max-w-3xl px-5 py-24 text-center text-primary-foreground sm:px-8 lg:py-28"
          >
            <h2 className="font-display text-5xl leading-tight sm:text-6xl">
              Kamu tidak harus selalu baik-baik saja.
            </h2>
            <p className="mx-auto mt-7 max-w-xl leading-8 text-primary-foreground/80">
              Ada hari ketika kamu produktif. Ada hari ketika kamu hanya ingin
              beristirahat. Keduanya tetap bagian dari perjalananmu.
            </p>
            <Link
              href="/auth/register"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-surface px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-peach-subtle"
            >
              Mulai Check-in Pertamamu{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="bg-peach-subtle">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <div
              data-reveal-stagger
              className="rounded-[28px] border border-border bg-surface px-7 py-14 text-center sm:px-12"
            >
              <p className="text-sm font-semibold text-brand">Hari ini</p>
              <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
                Mulai dari mengenal keadaanmu hari ini.
              </h2>
              <p className="mx-auto mt-5 max-w-lg leading-8 text-muted-foreground">
                Hanya beberapa pertanyaan sederhana. Dua menit untuk berhenti,
                mencatat, dan memahami.
              </p>
              <Link
                href="/auth/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
              >
                Mulai Check-in{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-5 text-sm text-muted-foreground">
                Tidak perlu langsung mengubah semuanya. Mulai dari satu langkah
                kecil.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
