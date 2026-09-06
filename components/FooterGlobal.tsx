"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Site-wide footer, shared by every page. Lifted from the landing page's
 * original footer — internal links are rooted at `/` (e.g. `/#fitur`)
 * rather than bare hashes so they still resolve when clicked from a page
 * other than `/`.
 *
 * Deliberately skips the `data-reveal-stagger` scroll-in hook the landing
 * page uses: that only animates in when `ScrollAnimations` is mounted, which
 * is landing-only, and this footer now renders on every route.
 *
 * Hidden on /onboarding: that flow is a focused walkthrough with no nav bar
 * either, and a footer full of marketing links doesn't belong in it.
 */
export default function FooterGlobal() {
  const pathname = usePathname();
  if (pathname === "/onboarding") return null;

  return (
    <footer className="border-t border-border bg-background/95">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Link href="/" className="font-display text-2xl text-brand">
            <Image
              src="/ruang_pijar_logo.png"
              alt="RuangPijar"
              width={478}
              height={476}
              className="h-10 w-10 object-contain"
            />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Ruang kecil untuk memahami dirimu.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">RuangPijar</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <Link href="/#beranda">Beranda</Link>
            <Link href="/#cara-kerja">Cara Kerja</Link>
            <Link href="/#fitur">Fitur</Link>
            <Link href="/#tentang">Tentang</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Dukungan</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <a href="mailto:halo@ruangpijar.id">Pusat Bantuan</a>
            <Link href="/#tentang">Privasi</Link>
            <Link href="/#tentang">Ketentuan Penggunaan</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl border-t border-border px-5 py-6 text-xs leading-5 text-muted-foreground sm:px-8">
        RuangPijar bukan layanan diagnosis atau pengganti bantuan profesional.
        Informasi dan insight yang diberikan ditujukan sebagai sarana refleksi
        dan dukungan keseharian.
        <br />
        <span className="mt-3 inline-block">
          &copy; 2026 RuangPijar. Dibuat untuk mendukung keseharian yang lebih
          sadar.
        </span>
      </div>
    </footer>
  );
}
