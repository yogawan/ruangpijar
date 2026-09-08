// lib/tour.ts
// The spotlight walk-through: which steps belong to which section, and the
// localStorage flag that keeps a finished walk-through finished.
//
// Steps are plain data here rather than react-joyride steps, so this file
// stays framework-free like the other label modules. `anchor` names a
// `data-tour` attribute instead of a class or a DOM shape, so restyling a
// page cannot silently break the tour — a renamed utility class is invisible,
// a missing `data-tour` is not. components/OnboardingTour.tsx does the
// translation.

export type TourSection =
  | "check-in"
  | "jejak"
  | "insight"
  | "ruang"
  | "profile";

export type TourStep = {
  /** The `data-tour` value to spotlight, or null for a step that belongs to
   * the page as a whole and is shown centred instead. */
  anchor: string | null;
  title: string;
  body: string;
  /** Overrides the section's mascot, for steps that open or close a tour. */
  mascot?: string;
  /** Which side of the anchor the tooltip prefers. It re-positions itself
   * when there is no room, so this is a hint rather than a guarantee. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Set on targets that live in the sticky header, so the spotlight is
   * positioned against the viewport rather than the document. */
  isFixed?: boolean;
};

type TourDefinition = {
  /** Exact pathname this tour belongs to. Detail routes below a section
   * (say /check-in/123) deliberately do not match — the tour explains the
   * section's own screen. */
  path: string;
  /** Shown on every step that does not name its own. */
  mascot: string;
  steps: TourStep[];
};

const MASCOT = {
  welcome: "/maskot-pijar/Welcome.webp",
  checkIn: "/maskot-pijar/Check-in Tutorial.webp",
  streak: "/maskot-pijar/Streak.webp",
  insight: "/maskot-pijar/Insight Tutorial.webp",
  action: "/maskot-pijar/Action Tutorial.webp",
  privacy: "/maskot-pijar/Privacy Tutorial.webp",
  success: "/maskot-pijar/Success.webp",
} as const;

export const TOURS: Record<TourSection, TourDefinition> = {
  // The first tour a new account sees — /onboarding hands off to /check-in —
  // so this one also carries the orientation for the app as a whole.
  "check-in": {
    path: "/check-in",
    mascot: MASCOT.checkIn,
    steps: [
      {
        anchor: null,
        mascot: MASCOT.welcome,
        title: "Halo, aku Pijar",
        body: "Sebentar saja, aku tunjukkan cara memakai ruang ini. Kamu bisa berhenti kapan pun.",
      },
      {
        anchor: "nav",
        isFixed: true,
        placement: "bottom",
        title: "Empat langkah, satu lingkaran",
        body: "Check-in untuk mencatat, Jejak untuk melihat kembali, Insight untuk polanya, Ruang untuk mencoba sesuatu. Profil ada di ujung.",
      },
      {
        anchor: "check-in-progress",
        placement: "bottom",
        title: "Lima langkah pendek",
        body: "Pertanyaannya sedikit, dan yang tidak wajib boleh dilewati. Tidak ada jawaban yang salah.",
      },
      {
        anchor: "check-in-mood",
        placement: "bottom",
        title: "Mulai dari perasaan",
        body: "Pilih wajah yang paling dekat dengan harimu. Cukup itu untuk memulai.",
      },
      {
        anchor: "check-in-actions",
        mascot: MASCOT.success,
        placement: "top",
        title: "Simpan kalau sudah siap",
        body: "Lanjut sampai langkah terakhir, lalu simpan. Check-in-mu langsung masuk ke Jejak.",
      },
    ],
  },

  jejak: {
    path: "/jejak",
    mascot: MASCOT.streak,
    steps: [
      {
        anchor: "jejak-kalender",
        placement: "right",
        title: "Sebulan dalam satu layar",
        body: "Hari yang sudah kamu isi tampil berwarna. Ketuk tanggalnya untuk membaca ulang check-in hari itu.",
      },
      {
        anchor: "jejak-feed",
        placement: "left",
        title: "Latihan dan insight",
        body: "Latihan yang kamu jalani dari Ruang dan pola yang ditemukan berkumpul di sini, yang terbaru lebih dulu.",
      },
    ],
  },

  insight: {
    path: "/insight",
    mascot: MASCOT.insight,
    steps: [
      {
        anchor: "insight-list",
        placement: "top",
        title: "Pola dari catatanmu sendiri",
        body: "Insight dibaca dari check-in yang sudah terkumpul. Bukan diagnosis — hanya hal yang mulai terlihat.",
      },
      {
        anchor: "insight-filter",
        placement: "bottom",
        title: "Sisakan yang belum dibaca",
        body: "Saring daftarnya kalau yang sudah kamu baca mulai menumpuk.",
      },
      {
        anchor: "insight-generate",
        placement: "top",
        title: "Cari pola kapan saja",
        body: "Insight tidak muncul sendiri. Setelah beberapa hari check-in, tekan ini untuk memeriksa apakah ada pola baru.",
      },
    ],
  },

  ruang: {
    path: "/ruang",
    mascot: MASCOT.action,
    steps: [
      {
        anchor: "ruang-filter",
        placement: "bottom",
        title: "Disusun dari check-in terakhirmu",
        body: '"Untuk kamu" menyesuaikan dengan yang sedang kamu rasakan. Sisanya bisa kamu telusuri per kategori.',
      },
      {
        anchor: "ruang-list",
        placement: "top",
        title: "Sesuatu yang kecil dulu",
        body: "Pilih satu, tekan Mulai, lalu tandai Selesai atau Lewati. Keduanya sama-sama tidak apa-apa.",
      },
    ],
  },

  profile: {
    path: "/profile",
    mascot: MASCOT.privacy,
    steps: [
      {
        anchor: "profile-account",
        placement: "right",
        title: "Akunmu",
        body: "Nama dan foto yang tampil di ruangmu. Emailmu dipakai untuk masuk, jadi belum bisa diubah.",
      },
      {
        anchor: "profile-preferences",
        placement: "right",
        title: "Atur ulang kapan saja",
        body: "Yang kamu pilih saat pertama masuk ada di sini. Ubah sesukamu — ini yang jadi patokan saran di Ruang.",
      },
      {
        anchor: "profile-tour",
        placement: "top",
        title: "Butuh diingatkan lagi?",
        body: "Panduan ini bisa kamu putar ulang dari sini, kapan pun kamu mau.",
      },
    ],
  },
};

/** The section a pathname belongs to, or null where no tour is defined. */
export function tourSectionFor(pathname: string): TourSection | null {
  const found = Object.entries(TOURS).find(
    ([, definition]) => definition.path === pathname,
  );

  return found ? (found[0] as TourSection) : null;
}

// Bumping the suffix re-shows every tour, which is what should happen when
// the steps below stop matching the screens they describe.
const STORAGE_KEY = "ruangpijar:tour-seen:v1";

const RESTART_EVENT = "ruangpijar:tour-restart";

type SeenMap = Partial<Record<TourSection, boolean>>;

// Storage is a preference, not data: Safari's private mode throws on write
// and an embedded webview may have it disabled outright. Either way the tour
// simply plays again next time, which is a far better failure than a page
// that will not render.
function readSeen(): SeenMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as SeenMap)
      : {};
  } catch {
    return {};
  }
}

export function hasSeenTour(section: TourSection) {
  return readSeen()[section] === true;
}

export function markTourSeen(section: TourSection) {
  try {
    const seen = readSeen();
    seen[section] = true;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
    // See readSeen.
  }
}

/**
 * Clears every section's flag and asks any mounted tour to play again.
 *
 * Both halves matter: the event restarts the tour on the screen the user
 * pressed the button on, and the cleared flags bring the rest back as they
 * navigate to them.
 */
export function restartTours() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // See readSeen.
  }

  window.dispatchEvent(new Event(RESTART_EVENT));
}

/** Returns an unsubscribe function. */
export function onTourRestart(callback: () => void): () => void {
  window.addEventListener(RESTART_EVENT, callback);
  return () => window.removeEventListener(RESTART_EVENT, callback);
}
