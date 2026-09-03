// models/User.ts
import { Schema, model, models, type InferSchemaType } from "mongoose";

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

    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      select: false,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel =
  models.User || model("User", userSchema);
