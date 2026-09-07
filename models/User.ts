// models/User.ts
import { type InferSchemaType, model, models, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    // Authentication
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },

    // No `default: null` — a stored null still occupies the sparse unique
    // index, so every credentials-only account after the first would collide.
    // Left unset, the document is skipped by the index entirely.
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // Daily check-in streak — maintained by `nextStreakState` (lib/streak.ts)
    // whenever a check-in is created, and by the /api/cron/streak-check
    // sweep when a streak lapses after 3 days of silence.
    currentStreak: {
      type: Number,
      default: 0,
    },

    lastCheckInAt: {
      type: Date,
      default: null,
    },

    // Guards the reminder sweep against emailing the same day twice if it
    // runs more than once — see /api/cron/streak-check.
    lastReminderSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model("User", userSchema);
