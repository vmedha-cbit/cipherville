import { Router } from "express";
import { requireParticipantSession } from "../middleware/auth.js";
import { getLobby, assignOfficer, dbLogin, submitCase, getAssignedStory, scanQr, getPhase1Story, getArticle, verifyPuzzle, getPhase2Questions, answerPhase2Question } from "../controllers/participantController.js";

const router = Router();

router.get("/lobby", requireParticipantSession, getLobby);
router.post("/assign-officer", requireParticipantSession, assignOfficer);
router.post("/scan-qr", requireParticipantSession, scanQr);
router.get("/article", requireParticipantSession, getArticle);
router.post("/db-login", requireParticipantSession, dbLogin);
router.get("/story", requireParticipantSession, getAssignedStory);
router.get("/phase2/questions", requireParticipantSession, getPhase2Questions);
router.post("/phase2/answer", requireParticipantSession, answerPhase2Question);
router.get("/phase1-story", requireParticipantSession, getPhase1Story);
router.post("/submit-case", requireParticipantSession, submitCase);
router.post("/verify-puzzle", requireParticipantSession, verifyPuzzle);

export default router;
