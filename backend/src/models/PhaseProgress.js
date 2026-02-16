import mongoose from "mongoose";

const phaseProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: String, required: true },
    phase: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    attempts: { type: Number, default: 0 },
    timeSpentSec: { type: Number, default: 0 },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export const PhaseProgress = mongoose.model("PhaseProgress", phaseProgressSchema);
