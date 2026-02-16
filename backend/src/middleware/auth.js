import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { User } from "../models/User.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }
    const payload = jwt.verify(token, env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub);
    if (!admin) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.admin = admin;
    next();
  } catch (err) {
    err.status = 401;
    next(err);
  }
};

export const requireParticipantSession = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    const sessionToken = req.headers["x-session-token"];
    if (!userId || !sessionToken) {
      return res.status(401).json({ error: "Missing session" });
    }
    const user = await User.findById(userId);
    if (!user || user.activeSession !== sessionToken) {
      return res.status(401).json({ error: "Invalid session" });
    }
    req.user = user;
    next();
  } catch (err) {
    err.status = 401;
    next(err);
  }
};
