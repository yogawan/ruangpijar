# RuangPijar BFF

REST API reference for the RuangPijar backend-for-frontend: Next.js Route Handlers under `/api/*`, backed by MongoDB/Mongoose.

## Authentication

Every endpoint except `/api/auth/*` requires the Auth.js session cookie. Sign in first:

- **Google** — send the browser to `/api/auth/signin` and complete the OAuth flow.
- **Email + password** — `POST /api/auth/callback/credentials` with `email` and `password`.

Once signed in, the browser holds `authjs.session-token` (or `__Secure-authjs.session-token` over HTTPS) and every subsequent request is authenticated automatically — there's no bearer token to copy around. `GET /api/auth/session` returns the current session, or `{}` if there isn't one.

## Resources

- **Me** — the signed-in user's own profile.
- **Check-ins** — mood/energy/stress logging, the core input signal.
- **Jejak** — a merged, read-only timeline of check-ins, action logs, and insights.
- **Insights** — rule-based observations generated from check-in history.
- **Actions** — a catalog of coping/wellness activities, with factor-based recommendations.
- **Action Logs** — a user's attempts at an Action (start → complete/skip).
- **Personalization** — per-user preferences and onboarding state.

See the [API Reference](/api) for every endpoint, request/response shape, and inline examples.
