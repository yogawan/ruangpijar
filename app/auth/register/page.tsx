// @/app/auth/register/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import RegisterView from "./register-view";

/**
 * Someone already signed in has no account left to create here, so they are
 * sent on to the app. See the note in ../login/page.tsx for why this check is
 * a Server Component rather than an effect.
 */
export default async function RegisterPage() {
  if (await getCurrentUserId()) redirect("/check-in");

  return <RegisterView />;
}
