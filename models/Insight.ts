// models/Insight.ts
import { type InferSchemaType, model, models, Schema } from "mongoose";

const insightSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["CORRELATION", "TREND", "PATTERN", "REFLECTION"],
      required: true,
    },

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

    metric: {
      type: String,
      enum: [
        "MOOD",
        "STRESS",
        "ENERGY",
        "SLEEP",
        "ACADEMIC_LOAD",
        "SOCIAL_LOAD",
      ],
      required: true,
    },

    relatedMetric: {
      type: String,
      enum: [
        "MOOD",
        "STRESS",
        "ENERGY",
        "SLEEP",
        "ACADEMIC_LOAD",
        "SOCIAL_LOAD",
        null,
      ],
      default: null,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },

    periodStart: {
      type: Date,
      required: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

insightSchema.index({
  userId: 1,
  createdAt: -1,
});

export type Insight = InferSchemaType<typeof insightSchema>;

export const InsightModel = models.Insight || model("Insight", insightSchema);
