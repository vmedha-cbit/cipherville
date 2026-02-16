import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { createOfficer, listOfficers, updateOfficer, deleteOfficer, dashboard, seedDemoData, seedOfficers } from "../controllers/adminController.js";

const router = Router();

router.get("/dashboard", requireAdmin, dashboard);
router.post("/seed", requireAdmin, seedDemoData);
router.post("/seed-officers", requireAdmin, seedOfficers);
router.post("/officers", requireAdmin, createOfficer);
router.get("/officers", requireAdmin, listOfficers);
router.patch("/officers/:officerId", requireAdmin, updateOfficer);
router.delete("/officers/:officerId", requireAdmin, deleteOfficer);

export default router;
