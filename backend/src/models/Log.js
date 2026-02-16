import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    roomId: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Log = mongoose.model("Log", logSchema);
