import { assignOfficerToUser } from "../services/officerAssignment.js";
import { Officer } from "../models/Officer.js";
import { Story } from "../models/Story.js";
import { User } from "../models/User.js";
import { logEvent } from "../services/logService.js";
import { getPuzzleConfig } from "../utils/puzzleConfigs.js";

const resolveStoryForUser = async (user, officer) => {
  if (officer?.storyId) {
    return officer.storyId;
  }
  if (user.assignedStory) {
    return user.assignedStory;
  }
  const stories = await Story.find().select("_id");
  if (!stories.length) {
    return null;
  }
  const picked = stories[Math.floor(Math.random() * stories.length)];
  user.assignedStory = picked._id;
  await user.save();
  return picked._id;
};

export const getLobby = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      rollNumber: user.rollNumber,
      roomId: user.roomId,
      phase: user.phase
    });
  } catch (err) {
    next(err);
  }
};

export const assignOfficer = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.roomId) {
      return res.status(400).json({ error: "Join a room first" });
    }
    const updated = await assignOfficerToUser(user._id, user.roomId);
    const officer = await Officer.findById(updated.assignedOfficer);
    res.json({ officer });
  } catch (err) {
    next(err);
  }
};

export const dbLogin = async (req, res, next) => {
  try {
    const user = req.user;
    const { username, password } = req.body || {};
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    user.attempts.dbLogin += 1;
    await user.save();
    if (username !== officer.name || password !== officer.dob) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    user.phase = "phase2";
    await user.save();
    await logEvent("db-login-success", { userId: user._id, roomId: user.roomId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const submitCase = async (req, res, next) => {
  try {
    const user = req.user;
    const { answer } = req.body || {};
    if (!answer) {
      return res.status(400).json({ error: "Answer required" });
    }
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    const story = await Story.findById(officer.storyId);
    if (!story) {
      return res.status(400).json({ error: "Story not assigned" });
    }
    user.attempts.caseSubmit += 1;
    await user.save();
    const ok = story.criminalName.toLowerCase().trim() === answer.toLowerCase().trim();
    if (ok) {
      user.phase = "complete";
      await user.save();
    }
    await logEvent("case-submit", { userId: user._id, roomId: user.roomId, ok });
    res.json({ ok });
  } catch (err) {
    next(err);
  }
};

export const getAssignedStory = async (req, res, next) => {
  try {
    const user = req.user;
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    const storyId = await resolveStoryForUser(user, officer);
    if (!storyId) {
      return res.status(400).json({ error: "Story not assigned" });
    }
    if (!user.phase2Story || String(user.phase2Story) !== String(storyId)) {
      user.phase2Story = storyId;
      user.phase2CorrectQuestions = [];
      await user.save();
    }
    const story = await Story.findById(storyId).select("title description pdfUrl sqliteTemplateId questions criminalName");
    res.json({ officer, story });
  } catch (err) {
    next(err);
  }
};

export const getPhase1Story = async (req, res, next) => {
  try {
    const user = req.user;
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    
    // Extract day, month, year from dob (DDMMYYYY format)
    const day = officer.dob?.substring(0, 2);
    const month = officer.dob?.substring(2, 4);
    const year = officer.dob?.substring(4, 8);
    
    res.json({
      officer: {
        name: officer.name,
        background: officer.background,
        story: officer.story,
        lastCase: officer.lastCase,
        dob: officer.dob,
        day,
        month,
        year,
        jumbledWord: officer.jumbledWord,
        jumbled: officer.jumbledWord, // Alias for compatibility
        answer: officer.answer,
        puzzleFolder: officer.puzzleFolder,
        routeOptions: officer.routeOptions
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getArticle = async (req, res, next) => {
  try {
    const user = req.user;
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    const article = {
      title: `${officer.name} Spotted at Public Event`,
      description: "Local law enforcement recognized at community gathering",
      dateHighlight: officer.dob.substring(0, 2), // Extract DD from DDMMYYYY
      officerName: officer.name,
      articleText: officer.articleText,
      content: officer.articleText,
      keyClue: `On the ${officer.dob.substring(0, 2)}th of this month, this event occurred on the birthday of ${officer.name}!`,
      publishDate: new Date(),
      section: "Public Affairs",
      byline: "Staff Reporter"
    };
    res.json({ article });
  } catch (err) {
    next(err);
  }
};

export const scanQr = async (req, res, next) => {
  try {
    const user = req.user;
    const { link } = req.body || {};
    if (!link) {
      return res.status(400).json({ error: "link required" });
    }
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    const validLink = officer.qrLinks?.[officer.qrLinks.length - 1];
    const ok = link === validLink;
    await logEvent("qr-scan", { userId: user._id, roomId: user.roomId, link, ok });
    res.json({ ok, articleText: ok ? officer.articleText : null });
  } catch (err) {
    next(err);
  }
};

export const verifyPuzzle = async (req, res, next) => {
  try {
    const user = req.user;
    const { placedKeys, placementOrder, puzzleId } = req.body || {};
    
    if (!user.assignedOfficer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    
    // Get the correct keys from officer's puzzle configuration
    const puzzleFolder = officer.puzzleFolder || "puzzle1";
    const puzzleConfig = getPuzzleConfig(puzzleFolder);
    const correctKeys = puzzleConfig.correctKeys;
    
    // Verify that placed keys match correct keys
    const sortedPlaced = (placedKeys || []).sort();
    const sortedCorrect = correctKeys.sort();
    
    const keysMatch = JSON.stringify(sortedPlaced) === JSON.stringify(sortedCorrect);
    
    if (!keysMatch) {
      await logEvent("puzzle-verify", { userId: user._id, roomId: user.roomId, ok: false });
      return res.status(400).json({ error: "Incorrect puzzle configuration. Keys do not match." });
    }
    
    // Extract month from officer's DOB (DDMMYYYY)
    const monthValue = officer.dob.substring(2, 4);
    
    user.attempts.puzzleSubmit = (user.attempts.puzzleSubmit || 0) + 1;
    await user.save();
    
    await logEvent("puzzle-verify", { userId: user._id, roomId: user.roomId, ok: true, puzzleId });
    
    res.json({ 
      ok: true, 
      monthValue,
      message: "Puzzle verified successfully!" 
    });
  } catch (err) {
    next(err);
  }
};

export const getPhase2Questions = async (req, res, next) => {
  try {
    const user = req.user;
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    const storyId = await resolveStoryForUser(user, officer);
    if (!storyId) {
      return res.status(400).json({ error: "Story not assigned" });
    }
    if (!user.phase2Story || String(user.phase2Story) !== String(storyId)) {
      user.phase2Story = storyId;
      user.phase2CorrectQuestions = [];
      await user.save();
    }
    const story = await Story.findById(storyId).select("questions");
    const questions = (story?.questions || []).map((q) => ({
      id: q._id,
      prompt: q.prompt
    }));
    res.json({ storyId, questions, correct: user.phase2CorrectQuestions || [] });
  } catch (err) {
    next(err);
  }
};

export const answerPhase2Question = async (req, res, next) => {
  try {
    const user = req.user;
    const { questionId, answer } = req.body || {};
    if (!questionId || !answer) {
      return res.status(400).json({ error: "questionId and answer required" });
    }
    const officer = await Officer.findById(user.assignedOfficer);
    if (!officer) {
      return res.status(400).json({ error: "Officer not assigned" });
    }
    const storyId = await resolveStoryForUser(user, officer);
    if (!storyId) {
      return res.status(400).json({ error: "Story not assigned" });
    }
    const story = await Story.findById(storyId).select("questions");
    const question = story?.questions?.find((q) => String(q._id) === String(questionId));
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    const normalizedAnswer = String(answer).trim().toLowerCase();
    const normalizedExpected = String(question.answer).trim().toLowerCase();
    const correct = normalizedAnswer === normalizedExpected;

    if (correct) {
      const current = user.phase2CorrectQuestions || [];
      const exists = current.some((id) => String(id) === String(questionId));
      if (!exists) {
        user.phase2CorrectQuestions = [...current, question._id];
        await user.save();
      }
    }

    const total = story?.questions?.length || 0;
    const correctCount = (user.phase2CorrectQuestions || []).length;
    const allCorrect = total > 0 && correctCount >= total;
    if (allCorrect) {
      user.phase = "phase2-complete";
      await user.save();
    }

    res.json({ ok: true, correct, total, correctCount, allCorrect });
  } catch (err) {
    next(err);
  }
};
