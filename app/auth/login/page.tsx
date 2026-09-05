"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setError(null);
    setPending(true);

    try {
      // `redirect: false` keeps a failed sign-in on this page so the message
      // can be shown inline. Note it answers 200 either way — `result.error`
      // is what distinguishes a rejection, not `result.ok`.
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (!result || result.error) {
        setError("Email atau password belum cocok.");
        setPending(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksimu.");
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            <Image
              src="/ruang_pijar_logo.png"
              alt="RuangPijar"
              width={478}
              height={476}
              className="h-10 w-10 object-contain"
            />
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight">
            Selamat datang kembali
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Masuk untuk melanjutkan perjalananmu.
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan password"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Masuk…" : "Login"}
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
          Lanjutkan dengan Google
        </button>

        {/* Register */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
