import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-6">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Ruang untuk memahami dirimu.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Kenali perjalananmu, refleksikan pengalamanmu, dan tumbuh dengan
            lebih sadar bersama RuangPijar.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/auth/login"
              className="rounded-xl border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
            >
              Login
            </Link>

            <Link
              href="/auth/register"
              className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Register
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
