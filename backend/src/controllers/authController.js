// Update user progress (phase, subphase, lastVisitedRoute, phase1YearRevealed)
export const updateProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { currentPhase, currentSubphase, lastVisitedRoute, phase1YearRevealed, year } = req.body;
    if (typeof currentPhase === "number") user.currentPhase = currentPhase;
    if (typeof currentSubphase === "number") user.currentSubphase = currentSubphase;
    if (typeof lastVisitedRoute === "string") user.lastVisitedRoute = lastVisitedRoute;
    if (typeof phase1YearRevealed === "boolean") {
      user.phase1YearRevealed = phase1YearRevealed;
      if (year) user.phase1Year = year;
    }
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// Get user progress (for route protection)
export const getProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      currentPhase: user.currentPhase,
      currentSubphase: user.currentSubphase,
      lastVisitedRoute: user.lastVisitedRoute,
      completedAt: user.completedAt,
      sessionActive: user.sessionActive,
      phase1YearRevealed: user.phase1YearRevealed,
      phase1Year: user.phase1Year
    });
  } catch (err) {
    next(err);
  }
};
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { User } from "../models/User.js";
import { GameConfig } from "../models/GameConfig.js";
import { makeId } from "../utils/id.js";
import { logEvent } from "../services/logService.js";

const ensureDefaultAdmin = async () => {
  const existing = await Admin.findOne({ username: env.ADMIN_DEFAULT_USER });
  if (!existing) {
    const passwordHash = await bcrypt.hash(env.ADMIN_DEFAULT_PASS, 10);
    await Admin.create({ username: env.ADMIN_DEFAULT_USER, passwordHash });
  }
};

export const participantLogin = async (req, res, next) => {
  try {
    const { rollNo, displayName } = req.body || {};
    if (!rollNo) {
      return res.status(400).json({ error: "rollNo is required" });
    }

    let user = await User.findOne({ rollNo });
    const now = new Date();
    
    // Step 1: If user does NOT exist, create new
    if (!user) {
      const sessionToken = jwt.sign({ userId: rollNo, ts: now.getTime() }, env.JWT_SECRET, { expiresIn: "6h" });
      
      user = await User.create({
        rollNo,
        displayName,
        sessionActive: true,
        activeSession: sessionToken,
        startedAt: now,
        gameStartedAt: now,
        timerDuration: 1800,
        gameStatus: "playing",
        completedAt: null,
        currentPhase: 1,
        currentSubphase: 1,
        lastVisitedRoute: "/officer"
      });
      
      // Assign officer immediately
      const { Officer } = await import("../models/Officer.js");
      const officers = await Officer.find();
      if (officers.length > 0) {
        const picked = officers[Math.floor(Math.random() * officers.length)];
        user.assignedOfficer = picked._id;
      }
      
      await user.save();
      
      // Initialize GameState
      const { GameState } = await import("../models/GameState.js");
      await GameState.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          status: "started",
          startTime: now,
          duration: 1800
        },
        { upsert: true, new: true }
      );
      
      return res.json({
        status: "new-session",
        userId: user._id,
        sessionToken,
        lastVisitedRoute: "/officer"
      });
    }

    // Step 2: If user exists
    // Check if game is completed
    if (user.completedAt || user.gameStatus === "completed") {
      return res.status(403).json({
        status: "completed",
        error: "Game already completed. Re-entry not allowed."
      });
    }

    // Check if game is timeout/expired (optional, depending on requirements, but user said 'after 30 mins... local progress cleared')
    // If we want to strictly enforce 30 mins from start:
    // const elapsed = (now - user.startedAt) / 1000;
    // if (elapsed > 1800) { ... handle timeout ... }
    
    // RESUME SESSION (Whether sessionActive was true or false)
    // We always generate a new token to ensure validity, but we KEEP the progress.
    const sessionToken = jwt.sign({ userId: user._id, ts: now.getTime() }, env.JWT_SECRET, { expiresIn: "6h" });
    
    // Ensure officer is assigned (recovery)
    if (!user.assignedOfficer) {
      const { Officer } = await import("../models/Officer.js");
      const officers = await Officer.find();
      if (officers.length > 0) {
        const picked = officers[Math.floor(Math.random() * officers.length)];
        user.assignedOfficer = picked._id;
      }
    }
    
    user.sessionActive = true;
    user.activeSession = sessionToken;
    await user.save();
    
    return res.json({
      status: "resume-session",
      userId: user._id,
      sessionToken,
      lastVisitedRoute: user.lastVisitedRoute || "/officer"
    });

  } catch (err) {
    next(err);
  }
};

export const participantLogout = async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      user.sessionActive = false;
      user.activeSession = null;
      await user.save();
      await logEvent("participant-logout", { userId: user._id, roomId: user.roomId });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    await ensureDefaultAdmin();
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: admin._id }, env.JWT_SECRET, { expiresIn: "12h" });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
