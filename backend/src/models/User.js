import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, unique: true },
    displayName: { type: String },
    activeSession: { type: String },
    roomId: { type: String },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "Officer" },
    assignedStory: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    phase2Story: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    phase2CorrectQuestions: [{ type: mongoose.Schema.Types.ObjectId }],
    phase: { type: String, default: "lobby" },
    attempts: {
      dbLogin: { type: Number, default: 0 },
      caseSubmit: { type: Number, default: 0 },
      sqlQueries: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
