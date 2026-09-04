// models/ActionLog.ts
import { type InferSchemaType, model, models, Schema } from "mongoose";

const actionLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    actionId: {
      type: Schema.Types.ObjectId,
      ref: "Action",
      required: true,
    },

    status: {
      type: String,
      enum: ["STARTED", "COMPLETED", "SKIPPED"],
      default: "STARTED",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

actionLogSchema.index({
  userId: 1,
  createdAt: -1,
});

export type ActionLog = InferSchemaType<typeof actionLogSchema>;

export const ActionLogModel =
  models.ActionLog || model("ActionLog", actionLogSchema);
