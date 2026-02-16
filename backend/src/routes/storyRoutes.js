import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { createStory, listStories, updateStory, deleteStory, addStoryQuestion, deleteStoryQuestion, bulkImportQuestions, importEvidence } from "../controllers/storyController.js";
import { uploadExcel } from "./uploadRoutes.js";

const router = Router();

router.post("/", requireAdmin, createStory);
router.get("/", requireAdmin, listStories);
router.patch("/:storyId", requireAdmin, updateStory);
router.delete("/:storyId", requireAdmin, deleteStory);
router.post("/:storyId/questions", requireAdmin, addStoryQuestion);
router.post("/:storyId/questions/bulk", requireAdmin, bulkImportQuestions);
router.delete("/:storyId/questions/:questionId", requireAdmin, deleteStoryQuestion);
router.post("/:storyId/import-evidence", requireAdmin, uploadExcel.single("file"), importEvidence);

export default router;
