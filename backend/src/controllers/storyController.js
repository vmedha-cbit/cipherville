import xlsx from "xlsx";
import { Story } from "../models/Story.js";
import { logEvent } from "../services/logService.js";

export const createStory = async (req, res, next) => {
  try {
    const story = await Story.create(req.body || {});
    await logEvent("story-create", { storyId: story._id });
    res.json(story);
  } catch (err) {
    next(err);
  }
};

export const listStories = async (req, res, next) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    next(err);
  }
};

export const updateStory = async (req, res, next) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.storyId, req.body || {}, { new: true });
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    await logEvent("story-update", { storyId: story._id });
    res.json(story);
  } catch (err) {
    next(err);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.storyId);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    await logEvent("story-delete", { storyId: story._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const addStoryQuestion = async (req, res, next) => {
  try {
    const { prompt, answer } = req.body || {};
    if (!prompt || !answer) {
      return res.status(400).json({ error: "prompt and answer required" });
    }
    const story = await Story.findByIdAndUpdate(
      req.params.storyId,
      { $push: { questions: { prompt, answer } } },
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    await logEvent("story-question-add", { storyId: story._id });
    res.json(story);
  } catch (err) {
    next(err);
  }
};

export const deleteStoryQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const story = await Story.findByIdAndUpdate(
      req.params.storyId,
      { $pull: { questions: { _id: questionId } } },
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    await logEvent("story-question-delete", { storyId: story._id, questionId });
    res.json(story);
  } catch (err) {
    next(err);
  }
};

export const bulkImportQuestions = async (req, res, next) => {
  try {
    const { questions } = req.body || {};
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: "questions must be an array" });
    }
    if (questions.length === 0) {
      return res.status(400).json({ error: "questions array is empty" });
    }
    const validated = questions.filter(
      (q) => q.prompt && q.answer
    ).map((q) => ({
      prompt: String(q.prompt),
      answer: String(q.answer)
    }));
    if (validated.length === 0) {
      return res.status(400).json({ error: "No valid questions (each must have prompt and answer)" });
    }
    const story = await Story.findByIdAndUpdate(
      req.params.storyId,
      { questions: validated },
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    await logEvent("story-questions-bulk-import", { storyId: story._id, count: validated.length });
    res.json({ ok: true, count: validated.length, story });
  } catch (err) {
    next(err);
  }
};

export const importEvidence = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: "File required" });
    }
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });
    const story = await Story.findByIdAndUpdate(
      storyId,
      { evidenceRecords: rows },
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    await logEvent("story-evidence-import", { storyId, rows: rows.length });
    res.json({ ok: true, rows: rows.length });
  } catch (err) {
    next(err);
  }
};
