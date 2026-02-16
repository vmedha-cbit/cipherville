import mongoose from "mongoose";
import { env } from "./env.js";

export const connectMongo = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }
  await mongoose.connect(env.MONGO_URI, {
    autoIndex: true
  });
  console.log("MongoDB connected");
};
