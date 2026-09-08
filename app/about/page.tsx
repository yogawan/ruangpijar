// @/app/about/page.tsx

import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import NavbarGlobal from "@/components/NavbarGlobal";
import ScrollAnimations from "@/components/ScrollAnimations";

export const metadata: Metadata = {
  title: "Tentang RuangPijar",
  description:
    "Apa itu RuangPijar, bagaimana cara kerjanya, prinsip yang kami pegang, dan siapa yang membangunnya.",
};

const loop = [
  [
    "01",
    "Check-in",
    "Ceritakan kondisi harianmu lewat beberapa pertanyaan sederhana tentang mood, energi, stres, tidur, dan aktivitas.",
    "/01_Check-in.png",
  ],
  [
    "02",
    "Jejak",
    "Setiap check-in menjadi bagian dari jejak keseharianmu. Seiring waktu, perubahan kecil pun mulai terlihat.",
    "/02_Jejak.png",
  ],
  [
    "03",
    "Insight",
    "RuangPijar membantu menghubungkan berbagai aspek keseharianmu berdasarkan catatanmu sendiri.",
    "/03_Insight.png",
  ],
  [
    "04",
    "Ruang",
    "Dapatkan rekomendasi langkah kecil yang relevan dengan kondisimu saat ini.",
    "/04_Ruang.png",
  ],
];

const principles = [
  ["Privat", "Data keseharianmu diakses melalui akunmu.", "/Privat.jpg"],
  [
    "Transparan",
    "Kamu tahu apa yang dicatat dan digunakan.",
    "/Transparan.jpg",
  ],
  [
    "Non-diagnostik",
    "Refleksi, bukan pengganti tenaga profesional.",
    "/Non-diagnostik.jpg",
  ],
];

const team = [
  ["Yogawan A. P. T.", "Frontend & UI/UX", "/Yogawan.png"],
  ["S. Ridho E.", "Frontend", "/Ridho.png"],
  ["A. Gading S.", "Backend", "/Gading.png"],
  ["Latief R.", "Backend", "/Latief.png"],
];

export default function AboutPage() {
  return (
    <>
      {/* The reveal targets below are parked at opacity 0 by globals.css for
          this to bring in, so it has to be mounted or the page stays blank.
          No `waitForSplash` — the splash only runs on "/". */}
      <ScrollAnimations />
      <NavbarGlobal variant="marketing" />

      <main className="flex-1 overflow-hidden bg-background text-foreground">
        {/* Intro */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <div data-reveal-stagger className="max-w-2xl">
            <p className="text-sm font-semibold text-brand">
              Tentang RuangPijar
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Ruang kecil untuk memahami dirimu.
            </h1>
            <p className="mt-6 leading-8 text-muted-foreground">
              RuangPijar adalah jurnal harian untuk mencatat bagaimana harimu
              terasa. Bukan untuk menilai, bukan untuk memberi label — hanya
              untuk membantumu melihat apa yang sedang terjadi pada dirimu
              sendiri.
            </p>
            <p className="mt-4 leading-8 text-muted-foreground">
              Tugas menumpuk, tidur berantakan, banyak hal yang harus
              dipikirkan. Kadang semuanya terasa baik-baik saja, kadang tidak.
              Dan sering kali kita baru menyadarinya ketika semuanya sudah
              terasa terlalu berat. RuangPijar hadir untuk membantu kamu
              melihatnya lebih awal.
            </p>
          </div>

          <div
            data-reveal
            className="mt-12 rounded-2xl bg-brand-subtle p-7 sm:p-9"
          >
            <p className="leading-8 text-muted-foreground">
              RuangPijar mengubah catatan kecil dari keseharianmu menjadi
              gambaran yang lebih mudah dipahami. Dengan check-in sederhana,
              kamu bisa melihat bagaimana mood, energi, stres, tidur, dan
              aktivitas sehari-hari saling berkaitan.
            </p>
            <p className="mt-7 border-t border-brand/15 pt-6 text-lg font-semibold text-brand">
              Tidak ada diagnosis. Tidak ada label.
              <br />
              Hanya data dari pengalamanmu sendiri.
            </p>
          </div>
        </section>

        {/* Cara kerja */}
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <div data-reveal className="max-w-2xl">
              <p className="text-sm font-semibold text-brand">Cara kerja</p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                Empat langkah yang berulang setiap hari.
              </h2>
            </div>

            <div
              data-reveal-stagger
              className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {loop.map(([step, title, text, image]) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      data-count
                      className="font-display text-4xl text-accent"
                    >
                      {step}
                    </span>
                    <Image
                      src={image}
                      alt=""
                      width={160}
                      height={160}
                      className="h-20 w-20 shrink-0 rounded-full object-contain"
                    />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Prinsip */}
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
          <div data-reveal>
            <Image
              src="/Ruangmu-tetap-milikmu.jpg"
              alt=""
              width={720}
              height={720}
              className="w-full rounded-2xl object-cover"
            />
          </div>

          <div data-reveal-stagger>
            <p className="text-sm font-semibold text-brand">
              Prinsip yang kami pegang
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
              {principles.map(([title, text, image]) => (
                <div key={title}>
                  <Image
                    src={image}
                    alt=""
                    width={160}
                    height={160}
                    className="h-16 w-16 rounded-full object-contain"
                  />
                  <dt className="mt-3 font-semibold text-brand">{title}</dt>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                    {text}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Tim */}
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <div data-reveal className="max-w-2xl">
              <p className="text-sm font-semibold text-brand">
                Di balik RuangPijar
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                Empat orang yang membangunnya.
              </h2>
              <p className="mt-6 leading-8 text-muted-foreground">
                RuangPijar dikerjakan oleh tim kecil yang membagi perannya
                antara tampilan yang kamu pakai setiap hari dan sistem yang
                menjaga catatanmu di belakangnya.
              </p>
            </div>

            <div
              data-reveal-stagger
              className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
            >
              {team.map(([name, role, photo]) => (
                <article
                  key={name}
                  className="overflow-hidden rounded-2xl border border-border"
                >
                  {/* bg-background is the photos' own backdrop colour, so the
                      frame reads as one surface instead of a pale box. */}
                  <div className="bg-background">
                    <Image
                      src={photo}
                      alt=""
                      width={309}
                      height={463}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                  <div className="px-5 py-4">
                    <h3 className="font-semibold">{name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{role}</p>
                  </div>
                </article>
              ))}
            </div>

            <div
              data-reveal
              className="mt-6 overflow-hidden rounded-2xl border border-border bg-background"
            >
              <Image
                src="/team.png"
                alt=""
                width={975}
                height={465}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </section>

        {/* Penutup */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Mulai dari satu check-in hari ini.
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
          </div>
        </section>
      </main>
    </>
  );
}
