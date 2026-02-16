import { Router } from "express";
import { participantLogin, participantLogout, adminLogin } from "../controllers/authController.js";
import { loginLimiter } from "../middleware/rateLimit.js";
import { requireParticipantSession } from "../middleware/auth.js";

const router = Router();

router.post("/participant-login", loginLimiter, participantLogin);
router.post("/participant-logout", requireParticipantSession, participantLogout);
router.post("/admin-login", loginLimiter, adminLogin);

export default router;
