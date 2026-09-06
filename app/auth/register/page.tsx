// @/app/auth/register/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";
import NavbarGlobal from "@/components/NavbarGlobal";

const MIN_PASSWORD_LENGTH = 8;

const ERROR_BY_STATUS: Record<number, string> = {
  400: "Ada data yang belum sesuai. Coba periksa lagi.",
  409: "Email ini sudah terdaftar. Coba masuk saja.",
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    if (password !== String(formData.get("confirmPassword") ?? "")) {
      setError("Konfirmasi password belum sama.");
      return;
    }

    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password,
        }),
      });

      if (!response.ok) {
        setError(
          ERROR_BY_STATUS[response.status] ??
            "Pendaftaran belum berhasil. Coba lagi sebentar lagi.",
        );
        setPending(false);
        return;
      }

      router.push("/auth/login");
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksimu.");
      setPending(false);
    }
  }

  return (
    <>
      <NavbarGlobal variant="marketing" />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Buat akunmu</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Mulai perjalanan untuk mengenali dirimu lebih dalam.
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nama
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nama lengkap"
                maxLength={100}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Buat password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <p className="text-xs text-muted-foreground">
                Minimal {MIN_PASSWORD_LENGTH} karakter.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Konfirmasi Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Ulangi password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Mendaftarkan…" : "Register"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ATAU</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google */}
          <button
            type="button"
            disabled={pending}
            onClick={() => signIn("google", { redirectTo: "/onboarding" })}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-lg">G</span>
            Daftar dengan Google
          </button>

          {/* Login */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
