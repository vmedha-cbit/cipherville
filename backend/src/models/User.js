import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    rollNo: { type: String, required: true, unique: true }, // Unique identifier for login
    displayName: { type: String },
    sessionActive: { type: Boolean, default: false },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    currentPhase: { type: Number, default: 1 },
    currentSubphase: { type: Number, default: 1 },
    lastVisitedRoute: { type: String, default: "/phase1" },
    otpVerified: { type: Boolean, default: false }, // User must enter OTP to start game
    gameCompleted: { type: Boolean, default: false }, // Quick access for completion status

    // Legacy/compatibility fields (keep for now)
    rollNumber: { type: String, default: null },
    activeSession: { type: String },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "Officer" },
    assignedStory: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    phase2Story: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    phase2CorrectQuestions: [{ type: mongoose.Schema.Types.ObjectId }],
    phase: { type: String, default: "officer" },
    gameStatus: { type: String, default: "playing" },
    currentPhaseLegacy: { type: String, default: "officer" },
    currentSubPhaseLegacy: { type: String, default: null },
    lastVisitedRouteLegacy: { type: String, default: "/officer" },
    gameStartedAt: { type: Date, default: null },
    timerDuration: { type: Number, default: 1800 },
    phase1YearRevealed: { type: Boolean, default: false },
    phase1Year: { type: String, default: null },
    attempts: {
      dbLogin: { type: Number, default: 0 },
      caseSubmit: { type: Number, default: 0 },
      sqlQueries: { type: Number, default: 0 }
    },
    progressTracking: [{
      subphase: { type: String },
      completedAt: { type: Date },
      timeRemaining: { type: Number },
      timeElapsed: { type: Number }
    }]
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
