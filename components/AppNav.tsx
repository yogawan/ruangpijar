"use client";

import {
  BookOpen,
  CircleUser,
  Lightbulb,
  PenLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* The four steps of the loop the product is built around — Reflect, Record,
   Understand, Act — plus the account. Kept in that order so the nav mirrors
   the journey rather than the alphabet. */
const ITEMS = [
  { href: "/check-in", label: "Check-in", Icon: PenLine },
  { href: "/jejak", label: "Jejak", Icon: BookOpen },
  { href: "/insight", label: "Insight", Icon: Lightbulb },
  { href: "/ruang", label: "Ruang", Icon: Sparkles },
  { href: "/profile", label: "Profil", Icon: CircleUser },
];

/**
 * Navigation between the signed-in pages, shown once onboarding is done.
 *
 * Detail routes (`/check-in/[id]`, `/insight/[id]`) deliberately leave this
 * out — they carry their own "Kembali ke ..." link, and showing both would
 * offer two competing ways back.
 */
export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi aplikasi"
      className="mt-6 flex flex-wrap justify-center gap-1"
    >
      {ITEMS.map(({ href, label, Icon }) => {
        // Detail routes keep their section highlighted: /check-in/123 still
        // reads as "Check-in".
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

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
    </nav>
  );
}
