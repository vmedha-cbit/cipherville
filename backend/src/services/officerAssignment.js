import { assignStoryFairly } from "./storyAllocation.js";
import { Officer } from "../models/Officer.js";
import { Story } from "../models/Story.js";
import { User } from "../models/User.js";

export const assignOfficerToUser = async (userId, roomId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.assignedOfficer) {
    return user;
  }

  const roomUsers = await User.find({ roomId, assignedOfficer: { $ne: null } }).select("assignedOfficer");
  const assignedIds = new Set(roomUsers.map((u) => String(u.assignedOfficer)));

  const officers = await Officer.find();
  if (!officers.length) {
    throw new Error("No officers configured");
  }

  const available = officers.filter((o) => !assignedIds.has(String(o._id)));
  const pool = available.length ? available : officers;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  user.assignedOfficer = picked._id;
  await user.save();
  return user;
};

export const assignStoryToUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  // Use fair round-robin allocation system
  const assignedStory = await assignStoryFairly();
  
  user.phase2Story = assignedStory._id;
  await user.save();
  
  return assignedStory;
};
