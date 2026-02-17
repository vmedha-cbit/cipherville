import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { createOfficer, listOfficers, updateOfficer, deleteOfficer, dashboard, seedDemoData, seedOfficers, getFastestSolvers, getTimerDuration, setTimerDuration, deleteAllUsers } from "../controllers/adminController.js";

const router = Router();

router.get("/dashboard", requireAdmin, dashboard);
router.post("/seed", requireAdmin, seedDemoData);
router.post("/seed-officers", requireAdmin, seedOfficers);
router.delete("/users/all", requireAdmin, deleteAllUsers);
router.post("/officers", requireAdmin, createOfficer);
router.get("/officers", requireAdmin, listOfficers);
router.patch("/officers/:officerId", requireAdmin, updateOfficer);
router.delete("/officers/:officerId", requireAdmin, deleteOfficer);
router.get("/fastest-solvers", requireAdmin, getFastestSolvers);
router.get("/timer-duration", requireAdmin, getTimerDuration);
router.post("/timer-duration", requireAdmin, setTimerDuration);

export default router;
