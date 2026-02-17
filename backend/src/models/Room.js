import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    status: { type: String, default: "waiting" }, // waiting, started, ended
    currentPhase: { type: String, default: "lobby" },
    startTime: { type: Date },
    endTime: { type: Date },
    timerDuration: { type: Number, default: 1800 }, // 30 minutes in seconds (30 * 60)
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
