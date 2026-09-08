"use client";

import {
  BookOpen,
  CircleUser,
  Flame,
  Lightbulb,
  Menu,
  PenLine,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/* The four steps of the loop the product is built around — Reflect, Record,
   Understand, Act — plus the account. Kept in that order so the nav mirrors
   the journey rather than the alphabet. */
const APP_ITEMS = [
  { href: "/check-in", label: "Check-in", Icon: PenLine },
  { href: "/jejak", label: "Jejak", Icon: BookOpen },
  { href: "/insight", label: "Insight", Icon: Lightbulb },
  { href: "/ruang", label: "Ruang", Icon: Sparkles },
  { href: "/profile", label: "Profil", Icon: CircleUser },
];

// "Tentang RuangPijar" points at the /about page rather than the landing's
// own #tentang section: both answer the same question, and offering the two
// side by side would only make a reader pick between them.
const MARKETING_LINKS = [
  { href: "/#beranda", label: "Beranda" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/about", label: "Tentang RuangPijar" },
  { href: "/#fitur", label: "Fitur" },
];

type NavbarGlobalProps = {
  /** "marketing" is the logged-out shell (landing, login, register).
   * "app" is the signed-in shell (onboarding through profile), showing the
   * same links `AppNav` used to. */
  variant: "marketing" | "app";
};

/**
 * Site-wide top bar, shared by every page. Which links it shows depends on
 * `variant` rather than on auth state — the same split the app already used
 * to decide where the old `AppNav` showed up, just centralised here so
 * there is exactly one nav bar per page instead of a bespoke header per
 * route.
 */
export default function NavbarGlobal({ variant }: NavbarGlobalProps) {
  const pathname = usePathname();
  const [streak, setStreak] = useState<number | null>(null);

  // Only the signed-in shell has a streak to show; fetched here rather than
  // passed down since every "app" page already renders this bar on its own.
  useEffect(() => {
    if (variant !== "app") return;

    const controller = new AbortController();

    fetch("/api/me", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setStreak(data?.currentStreak ?? null))
      .catch(() => {});

    return () => controller.abort();
  }, [variant]);

  return (
    <header
      data-header
      className="sticky top-0 z-30 border-border/90 border-b bg-background/95"
    >
      <nav
        // The walk-through spotlights the whole bar rather than the row of
        // links inside it, which is display:none below `md` and so would be
        // no target at all on a phone.
        data-tour={variant === "app" ? "nav" : undefined}
        className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8"
        aria-label={
          variant === "marketing" ? "Navigasi utama" : "Navigasi aplikasi"
        }
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-2xl text-brand">
            <Image
              src="/ruang_pijar_logo.webp"
              alt="RuangPijar"
              width={478}
              height={476}
              className="h-11 w-11 object-contain"
            />
          </Link>

          {variant === "app" && streak !== null && streak > 0 ? (
            <span
              title={`${streak} hari berturut-turut check-in`}
              className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-foreground"
            >
              <Flame className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              {streak}
            </span>
          ) : null}
        </div>

        {variant === "marketing" ? (
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {MARKETING_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-brand"
              >
                {label}
              </Link>
            ))}
          </div>
        ) : (
          <div className="hidden items-center gap-1 md:flex">
            {APP_ITEMS.map(({ href, label, Icon }) => {
              // Detail routes (e.g. /check-in/123) still read as their
              // parent section.
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {variant === "marketing" ? (
          <Link
            href="/auth/register"
            className="hidden rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover sm:inline-flex"
          >
            Mulai Check-in
          </Link>
        ) : null}

        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground">
            <Menu className="h-4 w-4" aria-hidden="true" />
            Menu
          </summary>

          <div className="absolute right-0 z-20 mt-2 grid w-48 gap-1 rounded-xl border border-border bg-surface p-2 text-sm shadow-md">
            {variant === "marketing" ? (
              <>
                <Link
                  href="/#cara-kerja"
                  className="rounded-lg px-3 py-2 hover:bg-surface-muted"
                >
                  Cara Kerja
                </Link>
                <Link
                  href="/#fitur"
                  className="rounded-lg px-3 py-2 hover:bg-surface-muted"
                >
                  Fitur
                </Link>
                <Link
                  href="/about"
                  className="rounded-lg px-3 py-2 hover:bg-surface-muted"
                >
                  Tentang RuangPijar
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-brand px-3 py-2 text-primary-foreground"
                >
                  Mulai Check-in
                </Link>
              </>
            ) : (
              APP_ITEMS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface-muted"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              ))
            )}
          </div>
        </details>
      </nav>
    </header>
  );
}
