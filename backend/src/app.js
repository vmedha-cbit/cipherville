import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import sqlRoutes from "./routes/sqlRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("combined"));
app.use("/uploads", express.static(env.UPLOAD_DIR));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "cipherville-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/sql", sqlRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/public", publicRoutes);

app.use(errorHandler);

export default app;
