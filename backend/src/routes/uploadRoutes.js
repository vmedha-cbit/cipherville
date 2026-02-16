import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env.js";
import { requireAdmin } from "../middleware/auth.js";
import { saveTemplateSqlite } from "../services/sqliteService.js";

const router = Router();

if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage });

export const uploadExcel = upload;

router.post("/file", requireAdmin, upload.single("file"), (req, res) => {
  res.json({ path: req.file.path });
});

router.post("/sqlite-template/:storyId", requireAdmin, upload.single("file"), (req, res) => {
  const { storyId } = req.params;
  const fileName = saveTemplateSqlite(storyId, req.file.path);
  res.json({ ok: true, fileName });
});

export default router;
