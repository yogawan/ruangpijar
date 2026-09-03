// app/api/auth/register/route.ts
// Static segment, so it is matched before the [...nextauth] catch-all.
import bcrypt from "bcryptjs";
import { handleApiError, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === 11000
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonError("Invalid JSON body", 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name) return jsonError("Name is required", 400);
  if (!EMAIL_PATTERN.test(email))
    return jsonError("A valid email is required", 400);
  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      400,
    );
  }

  try {
    await connectDB();

    if (await UserModel.exists({ email })) {
      return jsonError("Email already registered", 409);
    }

    const user = await UserModel.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });

    return Response.json(
      { id: user._id.toString(), name: user.name, email: user.email },
      { status: 201 },
    );
  } catch (error) {
    // Two requests can pass the `exists` check before either one inserts.
    if (isDuplicateKeyError(error)) {
      return jsonError("Email already registered", 409);
    }
    return handleApiError(error);
  }
}
