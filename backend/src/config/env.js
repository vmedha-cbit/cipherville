import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  ADMIN_DEFAULT_USER: process.env.ADMIN_DEFAULT_USER || "admin",
  ADMIN_DEFAULT_PASS: process.env.ADMIN_DEFAULT_PASS || "admin",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./storage/uploads",
  SQLITE_TEMPLATE_DIR: process.env.SQLITE_TEMPLATE_DIR || "./storage/sqlite-templates",
  SQLITE_USER_DIR: process.env.SQLITE_USER_DIR || "./storage/sqlite-user",
  MAX_LOGIN_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS || 5)
};
