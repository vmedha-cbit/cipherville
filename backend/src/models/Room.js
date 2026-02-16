import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    status: { type: String, default: "waiting" },
    currentPhase: { type: String, default: "lobby" },
    startTime: { type: Date },
    endTime: { type: Date },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
