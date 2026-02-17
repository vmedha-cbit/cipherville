import { Router } from "express";
import { participantLogin, participantLogout, adminLogin, verifyOtp } from "../controllers/authController.js";
import { loginLimiter } from "../middleware/rateLimit.js";
import { requireParticipantSession } from "../middleware/auth.js";

const router = Router();

router.post("/participant-login", loginLimiter, participantLogin);
router.post("/participant-logout", requireParticipantSession, participantLogout);
router.post("/verify-otp", requireParticipantSession, verifyOtp);
router.post("/admin-login", loginLimiter, adminLogin);

export default router;
