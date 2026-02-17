import { Router } from "express";
import { requireParticipantSession } from "../middleware/auth.js";
import { getLobby, getProfile, assignOfficer, dbLogin, submitCase, getAssignedStory, scanQr, getPhase1Story, getArticle, verifyPuzzle, getPhase2Questions, answerPhase2Question, saveProgress, getUserProgress, endGame, getGameStatus } from "../controllers/participantController.js";
import { updateProgress, getProgress } from "../controllers/authController.js";

const router = Router();

router.get("/lobby", requireParticipantSession, getLobby);
router.get("/profile", requireParticipantSession, getProfile);
router.get("/game/status", requireParticipantSession, getGameStatus);
router.post("/assign-officer", requireParticipantSession, assignOfficer);

// Progress update and fetch
router.post("/progress/update", requireParticipantSession, updateProgress);
router.get("/progress", requireParticipantSession, getProgress);
router.post("/scan-qr", requireParticipantSession, scanQr);
router.get("/article", requireParticipantSession, getArticle);
router.post("/db-login", requireParticipantSession, dbLogin);
router.get("/story", requireParticipantSession, getAssignedStory);
router.get("/phase2/questions", requireParticipantSession, getPhase2Questions);
router.post("/phase2/answer", requireParticipantSession, answerPhase2Question);
router.get("/phase1-story", requireParticipantSession, getPhase1Story);
router.post("/submit-case", requireParticipantSession, submitCase);
router.post("/verify-puzzle", requireParticipantSession, verifyPuzzle);
router.post("/save-progress", requireParticipantSession, saveProgress);
router.get("/progress", requireParticipantSession, getUserProgress);
router.post("/end-game", requireParticipantSession, endGame);

export default router;
