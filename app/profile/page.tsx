// @/app/profile/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { type FormEvent, useEffect, useState } from "react";
import NavbarGlobal from "@/components/NavbarGlobal";
import {
  CHECK_IN_FREQUENCIES,
  editablePersonalization,
  FOCUS_AREAS,
  type Personalization,
} from "@/lib/personalization-labels";

// Shape returned by GET /api/me. passwordHash and googleId are select:false
// server side, so they never reach the client.
type Me = {
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
};

type Section = "account" | "preferences";

const NAME_MAX = 100;

const JOINED_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const LOAD_ERROR = "Profilmu belum bisa dimuat. Coba muat ulang halaman.";
const NETWORK_ERROR = "Tidak bisa terhubung ke server. Periksa koneksimu.";

const ERROR_BY_STATUS: Record<number, string> = {
  400: "Ada isian yang belum sesuai. Coba periksa lagi.",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const CHOICE_CLASS =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/10";

const ALERT_CLASS =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

const HINT_CLASS = "text-xs text-muted-foreground";

const PRIMARY_BUTTON_CLASS =
  "w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

const OUTLINE_BUTTON_CLASS =
  "w-full rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

const SECTION_CLASS = "rounded-xl border border-border px-4 py-5";

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [preferences, setPreferences] = useState<Personalization | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Each section saves to its own endpoint, so pending and saved state are
  // tracked per section rather than for the page as a whole.
  const [saving, setSaving] = useState<Section | null>(null);
  const [saved, setSaved] = useState<Section | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [meResponse, prefResponse] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/personalization"),
        ]);

        if (meResponse.status === 401 || prefResponse.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (!meResponse.ok || !prefResponse.ok) {
          if (active) setError(LOAD_ERROR);
          return;
        }

        const [meData, prefData] = (await Promise.all([
          meResponse.json(),
          prefResponse.json(),
        ])) as [Me, Personalization];

        if (!active) return;

        setMe(meData);
        setPreferences(editablePersonalization(prefData));
      } catch {
        if (active) setError(NETWORK_ERROR);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [router]);

  // Shared by both sections: returns true when the save landed.
  async function save(section: Section, url: string, body: unknown) {
    setError(null);
    setSaved(null);
    setSaving(section);

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return false;
      }

      if (!response.ok) {
        setError(
          ERROR_BY_STATUS[response.status] ??
            "Perubahanmu belum tersimpan. Coba lagi sebentar lagi.",
        );
        return false;
      }

      setSaved(section);
      return true;
    } catch {
      setError(NETWORK_ERROR);
      return false;
    } finally {
      setSaving(null);
    }
  }

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();

    const updated = await save("account", "/api/me", {
      name: String(formData.get("name") ?? "").trim(),
      // Nullable field — an emptied input means "no avatar", not "".
      avatarUrl: avatarUrl || null,
    });

    // Keeps the header in step with the name that was just saved.
    if (updated) router.refresh();
  }

  async function handlePreferencesSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preferences) return;

    await save("preferences", "/api/personalization", preferences);
  }

  function toggleFocusArea(value: string) {
    setSaved(null);
    setPreferences((current) =>
      current === null
        ? current
        : {
            ...current,
            focusAreas: current.focusAreas.includes(value)
              ? current.focusAreas.filter((area) => area !== value)
              : [...current.focusAreas, value],
          },
    );
  }

  if (!me || !preferences) {
    return (
      <>
        <NavbarGlobal variant="app" />

        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            {error ? (
              <p role="alert" className={ALERT_CLASS}>
                {error}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Memuat profilmu…</p>
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavbarGlobal variant="app" />

      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Profil</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Bergabung sejak {JOINED_FORMAT.format(new Date(me.createdAt))}.
            </p>
          </div>

          {error ? (
            <p role="alert" className={`mb-5 ${ALERT_CLASS}`}>
              {error}
            </p>
          ) : null}

          {/* Akun — PATCH /api/me */}
          <form onSubmit={handleAccountSubmit} className={SECTION_CLASS}>
            <h2 className="text-sm font-medium">Akun</h2>

            <div className="mt-4 space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nama
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  defaultValue={me.name}
                  maxLength={NAME_MAX}
                  required
                  onChange={() => setSaved(null)}
                  className={FIELD_CLASS}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>

                {/* Read-only: the API does not accept an email change, since
                    it is the credentials login identity. */}
                <input
                  id="email"
                  type="email"
                  value={me.email}
                  readOnly
                  disabled
                  className={`${FIELD_CLASS} cursor-not-allowed opacity-60`}
                />

                <p className={HINT_CLASS}>
                  Email tidak bisa diubah untuk saat ini.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="avatarUrl" className="text-sm font-medium">
                  Foto profil
                </label>

                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  defaultValue={me.avatarUrl ?? ""}
                  onChange={() => setSaved(null)}
                  className={FIELD_CLASS}
                />

                <p className={HINT_CLASS}>Tautan gambar. Boleh dikosongkan.</p>
              </div>

              <button
                type="submit"
                disabled={saving !== null}
                className={PRIMARY_BUTTON_CLASS}
              >
                {saving === "account" ? "Menyimpan…" : "Simpan akun"}
              </button>

              {saved === "account" ? (
                <p aria-live="polite" className={`text-center ${HINT_CLASS}`}>
                  Tersimpan.
                </p>
              ) : null}
            </div>
          </form>

          {/* Preferensi — PATCH /api/personalization */}
          <form
            onSubmit={handlePreferencesSubmit}
            className={`mt-4 ${SECTION_CLASS}`}
          >
            <h2 className="text-sm font-medium">Preferensi</h2>

            <div className="mt-4 space-y-5">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  Yang ingin kamu perhatikan
                </legend>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {FOCUS_AREAS.map((area) => (
                    <label key={area.value} className={CHOICE_CLASS}>
                      <input
                        type="checkbox"
                        name="focusAreas"
                        value={area.value}
                        checked={preferences.focusAreas.includes(area.value)}
                        onChange={() => toggleFocusArea(area.value)}
                        className="size-4 accent-primary"
                      />
                      {area.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  Frekuensi check-in
                </legend>

                <div className="space-y-2 pt-1">
                  {CHECK_IN_FREQUENCIES.map((frequency) => (
                    <label key={frequency.value} className={CHOICE_CLASS}>
                      <input
                        type="radio"
                        name="checkInFrequency"
                        value={frequency.value}
                        checked={
                          preferences.checkInFrequency === frequency.value
                        }
                        onChange={() => {
                          setSaved(null);
                          setPreferences({
                            ...preferences,
                            checkInFrequency: frequency.value,
                          });
                        }}
                        className="size-4 accent-primary"
                      />
                      {frequency.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <label
                  htmlFor="preferredCheckInTime"
                  className="text-sm font-medium"
                >
                  Waktu yang paling pas
                </label>

                <input
                  id="preferredCheckInTime"
                  name="preferredCheckInTime"
                  type="time"
                  value={preferences.preferredCheckInTime ?? ""}
                  onChange={(event) => {
                    setSaved(null);
                    setPreferences({
                      ...preferences,
                      preferredCheckInTime: event.target.value || null,
                    });
                  }}
                  className={FIELD_CLASS}
                />
              </div>

              <button
                type="submit"
                disabled={saving !== null}
                className={PRIMARY_BUTTON_CLASS}
              >
                {saving === "preferences" ? "Menyimpan…" : "Simpan preferensi"}
              </button>

              {saved === "preferences" ? (
                <p aria-live="polite" className={`text-center ${HINT_CLASS}`}>
                  Tersimpan.
                </p>
              ) : null}
            </div>
          </form>

          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/auth/login" })}
            className={`mt-4 ${OUTLINE_BUTTON_CLASS}`}
          >
            Keluar
          </button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Kembali ke{" "}
            <Link
              href="/jejak"
              className="font-medium text-primary hover:underline"
            >
              Jejak
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
