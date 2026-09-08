import Image from "next/image";

/**
 * The mascot's loading pose plus a caption, for the handful of pages that
 * gate their whole screen behind one fetch (onboarding, profile, and the
 * check-in/insight detail pages). Kept as one component rather than five
 * copies of the same markup so they can't drift from each other.
 */
export default function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Image
        src="/maskot-pijar/Loading.webp"
        alt=""
        width={280}
        height={280}
        className="h-40 w-40 animate-pulse object-contain"
      />

      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
