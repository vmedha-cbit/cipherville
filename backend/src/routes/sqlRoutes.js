import { Router } from "express";
import { requireParticipantSession } from "../middleware/auth.js";
import { runQuery, getSchema } from "../controllers/sqlController.js";

const router = Router();

router.post("/query", requireParticipantSession, runQuery);
router.get("/schema", requireParticipantSession, getSchema);

export default router;
