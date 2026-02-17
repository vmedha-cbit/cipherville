import mongoose from "mongoose";

const gameConfigSchema = new mongoose.Schema(
  {
    configKey: { type: String, required: true, unique: true, default: "story-allocation" },
    storyOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
    currentIndex: { type: Number, default: 0 },
    timerDuration: { type: Number, default: 1800 } // Global timer duration in seconds (default 30 minutes)
  },
  { timestamps: true }
);

export const GameConfig = mongoose.model("GameConfig", gameConfigSchema);
