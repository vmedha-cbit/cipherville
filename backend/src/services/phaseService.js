import { User } from "../models/User.js";
import { Room } from "../models/Room.js";

export const setUserPhase = async (userId, phase) => {
  await User.findByIdAndUpdate(userId, { phase });
};

export const setRoomPhase = async (roomId, phase) => {
  await Room.findOneAndUpdate({ roomId }, { currentPhase: phase });
};
