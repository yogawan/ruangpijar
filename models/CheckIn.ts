// models/CheckIn.ts
import { Schema, model, models, type InferSchemaType } from "mongoose";

const checkInSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    energy: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    stress: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
      default: null,
    },

    academicLoad: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },

    socialLoad: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },

    factors: {
      type: [
        {
          type: String,
          enum: [
            "ACADEMIC",
            "WORK",
            "SOCIAL",
            "FAMILY",
            "FINANCIAL",
            "SLEEP",
            "RELATIONSHIP",
            "SELF",
            "OTHER",
          ],
        },
      ],
      default: [],
    },

    reflection: {
      type: String,
      maxlength: 2000,
      default: null,
    },

    checkedInAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

checkInSchema.index({
  userId: 1,
  checkedInAt: -1,
});

export type CheckIn = InferSchemaType<typeof checkInSchema>;

export const CheckInModel =
  models.CheckIn || model("CheckIn", checkInSchema);
