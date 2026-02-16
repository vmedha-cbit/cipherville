import { Router } from "express";
import { createRoom, listRooms, joinRoom, startRoom, endRoom, setRoomPhase, roomPlayers } from "../controllers/roomController.js";
import { requireAdmin, requireParticipantSession } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAdmin, createRoom);
router.get("/", requireAdmin, listRooms);
router.post("/join", requireParticipantSession, joinRoom);
router.post("/:roomId/start", requireAdmin, startRoom);
router.post("/:roomId/end", requireAdmin, endRoom);
router.post("/:roomId/phase", requireAdmin, setRoomPhase);
router.get("/:roomId/players", requireAdmin, roomPlayers);

export default router;
