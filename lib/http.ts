// lib/http.ts
import { Error as MongooseError } from "mongoose";

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function handleApiError(error: unknown): Response {
  if (error instanceof MongooseError.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(error.errors).map(([field, err]) => [field, err.message]),
    );
    return Response.json(
      { error: "Validation failed", details },
      { status: 400 },
    );
  }

  if (error instanceof MongooseError.CastError) {
    return jsonError("Invalid identifier", 400);
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}

export function pickFields(
  body: Record<string, unknown>,
  fields: readonly string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in body) result[field] = body[field];
  }
  return result;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      Number.parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) ||
        DEFAULT_LIMIT,
    ),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
