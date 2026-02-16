import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { makeId } from "../utils/id.js";
import { logEvent } from "../services/logService.js";
import { emitRoom } from "../socket/index.js";

export const createRoom = async (req, res, next) => {
  try {
    const roomId = makeId(6).toUpperCase();
    const room = await Room.create({ roomId });
    res.json(room);
  } catch (err) {
    next(err);
  }
};

export const listRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body || {};
    if (!roomId) {
      return res.status(400).json({ error: "roomId required" });
    }
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    const user = req.user;
    user.roomId = roomId;
    await user.save();
    if (!room.participants.includes(user._id)) {
      room.participants.push(user._id);
      await room.save();
    }
    await logEvent("room-joined", { userId: user._id, roomId });
    res.json({ ok: true, roomId });
  } catch (err) {
    next(err);
  }
};

export const startRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOneAndUpdate(
      { roomId },
      { status: "started", currentPhase: "pre-story", startTime: new Date() },
      { new: true }
    );
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    await logEvent("room-start", { roomId });
    emitRoom(roomId, "game-start", { roomId });
    res.json(room);
  } catch (err) {
    next(err);
  }
};

export const endRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOneAndUpdate(
      { roomId },
      { status: "ended", currentPhase: "complete", endTime: new Date() },
      { new: true }
    );
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    await User.updateMany({ roomId }, { phase: "complete" });
    await logEvent("room-end", { roomId });
    emitRoom(roomId, "game-end", { roomId });
    res.json(room);
  } catch (err) {
    next(err);
  }
};

export const setRoomPhase = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { phase } = req.body || {};
    const room = await Room.findOneAndUpdate({ roomId }, { currentPhase: phase }, { new: true });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    await logEvent("room-phase", { roomId, phase });
    res.json(room);
  } catch (err) {
    next(err);
  }
};

export const roomPlayers = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId }).populate("participants", "rollNumber phase assignedOfficer");
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room.participants);
  } catch (err) {
    next(err);
  }
};
