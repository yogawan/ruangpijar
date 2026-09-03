// models/Action.ts
import { Schema, model, models, type InferSchemaType } from "mongoose";

const actionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        "REFLECTION",
        "BREATHING",
        "RECOVERY",
        "PLANNING",
        "EDUCATION",
        "SUPPORT",
      ],
      required: true,
    },

    durationMinutes: {
      type: Number,
      min: 1,
      default: null,
    },

    relatedFactors: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Action = InferSchemaType<typeof actionSchema>;

export const ActionModel =
  models.Action || model("Action", actionSchema);
