// @/app/auth/login/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import LoginView from "./login-view";

/**
 * Signing in again when you already are is a dead end, so an existing session
 * is sent on to the app instead of being shown the form.
 *
 * The check lives here, in the Server Component, rather than in an effect
 * inside the view: the redirect then happens before anything is sent to the
 * browser, so the form never flashes on screen first. Auth.js keeps the
 * session in a JWT cookie, so this reads the cookie and does not touch the
 * database.
 */
export default async function LoginPage() {
  if (await getCurrentUserId()) redirect("/check-in");

  return <LoginView />;
}
