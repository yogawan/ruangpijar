import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RuangPijar — Ruang Aman untuk Pikiran yang Bising",
  description:
    "Jurnal visual tanpa distraksi yang mengerti perasaanmu. Ditenagai AI untuk validasi emosi seketika, diamankan oleh jaringan Web3 untuk privasi mutlak.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${sora.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* globals.css hides the scroll-reveal targets so GSAP can bring them
            in. Without JS that animation never runs, so restore them here. */}
        <noscript>
          <style>
            {
              "[data-hero-item],[data-hero-visual],[data-reveal],[data-reveal-stagger] > *,[data-count]{opacity:1}"
            }
          </style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
