import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { User } from "../models/User.js";
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
    const { rollNumber, displayName } = req.body || {};
    if (!rollNumber) {
      return res.status(400).json({ error: "rollNumber is required" });
    }
    let user = await User.findOne({ rollNumber });
    if (!user) {
      user = await User.create({ rollNumber, displayName });
    }
    if (user.activeSession) {
      return res.status(409).json({ error: "Active session exists" });
    }
    const sessionToken = makeId(24);
    user.activeSession = sessionToken;
    await user.save();
    await logEvent("participant-login", { userId: user._id });
    res.json({ userId: user._id, sessionToken, rollNumber: user.rollNumber });
  } catch (err) {
    next(err);
  }
};

export const participantLogout = async (req, res, next) => {
  try {
    const user = req.user;
    user.activeSession = null;
    await user.save();
    await logEvent("participant-logout", { userId: user._id, roomId: user.roomId });
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
