// models/Personalization.ts

import {
  Schema,
  model,
  models,
  type InferSchemaType,
} from "mongoose";

const personalizationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    focusAreas: {
      type: [
        {
          type: String,
          enum: [
            "MOOD",
            "STRESS",
            "ENERGY",
            "SLEEP",
            "ACADEMIC",
            "SOCIAL",
            "RELATIONSHIP",
            "SELF",
          ],
        },
      ],
      default: [],
    },

    checkInFrequency: {
      type: String,
      enum: [
        "DAILY",
        "FEW_TIMES_A_WEEK",
      ],
      default: "DAILY",
    },

    preferredCheckInTime: {
      type: String,
      default: null,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    onboardingCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type Personalization = InferSchemaType<
  typeof personalizationSchema
>;

export const PersonalizationModel =
  models.Personalization ||
  model("Personalization", personalizationSchema);
