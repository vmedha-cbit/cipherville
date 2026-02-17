import express from "express";
import { getPublicArticle } from "../controllers/publicController.js";

const router = express.Router();

router.get("/article", getPublicArticle);

export default router;
