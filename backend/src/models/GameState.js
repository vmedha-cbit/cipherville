import mongoose from "mongoose";

const gameStateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    status: { type: String, enum: ["not_started", "started", "completed"], default: "not_started" },
    startTime: { type: Date, default: null },
    duration: { type: Number, default: 1800 }, // 30 minutes in seconds
    endTime: { type: Date, default: null }
  },
  { timestamps: true }
);

export const GameState = mongoose.model("GameState", gameStateSchema);
