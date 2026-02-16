import { Log } from "../models/Log.js";

export const logEvent = async (event, meta = {}) => {
  await Log.create({
    event,
    userId: meta.userId,
    roomId: meta.roomId,
    meta
  });
};
