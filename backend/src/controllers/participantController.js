import { assignOfficerToUser } from "../services/officerAssignment.js";
import { assignStoryFairly } from "../services/storyAllocation.js";
import { Officer } from "../models/Officer.js";
import { Story } from "../models/Story.js";
import { User } from "../models/User.js";
import { GameState } from "../models/GameState.js";
import { GameConfig } from "../models/GameConfig.js";
import { logEvent } from "../services/logService.js";
import { getPuzzleConfig } from "../utils/puzzleConfigs.js";

const resolveStoryForUser = async (user, officer) => {
  if (officer?.storyId) {
    return officer.storyId;
  }
  if (user.assignedStory) {
    return user.assignedStory;
  }
  // Use fair round-robin allocation system for Phase 2
  if (!user.phase2Story) {
    const assignedStory = await assignStoryFairly();
    user.phase2Story = assignedStory._id;
    user.assignedStory = assignedStory._id;
    await user.save();
    return assignedStory._id;
  }
  // If phase2Story exists, use it
  user.assignedStory = user.phase2Story;
  await user.save();
  return user.phase2Story;
};

export const getLobby = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      rollNumber: user.rollNumber,
      phase: user.phase
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Calculate remaining time if game is still playing
    let timeRemaining = null;
    if (user.gameStartedAt && user.gameStatus === "playing") {
      const now = new Date();
      const elapsed = Math.floor((now - user.gameStartedAt) / 1000);
      const duration = user.timerDuration || 1800;
      timeRemaining = Math.max(0, duration - elapsed);
    }
    
    res.json({
      userId: user._id,
      rollNumber: user.rollNumber,
      displayName: user.displayName,
      phase: user.phase,
      gameStartedAt: user.gameStartedAt,
      timerDuration: user.timerDuration || 1800,
      gameStatus: user.gameStatus,
      timeRemaining: timeRemaining,
      assignedOfficer: user.assignedOfficer
    });
  } catch (err) {
    next(err);
  }
};

export const assignOfficer = async (req, res, next) => {
  try {
    const user = req.user;
    
    // If officer already assigned, return it
    if (user.assignedOfficer) {
      const officer = await Officer.findById(user.assignedOfficer);
      return res.json({ officer });
    }
    

    // Assign a random officer
    const officers = await Officer.find();
    if (!officers.length) {
      return res.status(400).json({ error: "No officers configured" });
    }

    // FETCH DYNAMIC TIMER DURATION FROM CONFIG
    let timerDuration = 1800; 
    try {
        const config = await GameConfig.findOne({ configKey: "timer-duration" });
        if (config && typeof config.timerDuration === 'number') {
            timerDuration = config.timerDuration;
        }
    } catch (e) {
        console.error("Config fetch error:", e);
    }
    
    // Log for debugging
    console.log(`Assigning officer to ${user.rollNumber || user.rollNo}. Using duration: ${timerDuration}s`);
    
    const picked = officers[Math.floor(Math.random() * officers.length)];
    user.assignedOfficer = picked._id;
    user.phase = "phase1";
    user.currentPhase = 1; // NUMBER, not string
    user.currentSubphase = 1;
    user.timerDuration = timerDuration; // Set user-specific duration
    await user.save();


    // Initialize game state on phase1
    await GameState.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        status: "started",
        startTime: new Date(),
        duration: timerDuration 
      },
      { upsert: true, new: true }
    );
    
    const officer = await Officer.findById(user.assignedOfficer);
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
    // Update phase to 2 (Phase 2)
    user.phase = "phase2";
    user.currentPhase = 2; // NUMBER, not string
    user.currentSubphase = 1;
    user.lastVisitedRoute = "/phase2";
    await user.save();
    await logEvent("db-login-success", { userId: user._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const submitCase = async (req, res, next) => {
  try {
    const user = req.user;
    
    // VALIDATION: Check if all Phase 2 questions were answered correctly
    const story = await Story.findById(user.phase2Story);
    if (!story) {
      user.gameStatus = "failed";
      await user.save();
      return res.status(400).json({ 
        ok: false, 
        error: "You couldn't solve the case",
        message: "Story not found. Game ended."
      });
    }
    
    const total = story?.questions?.length || 0;
    const correctCount = (user.phase2CorrectQuestions || []).length;
    const allCorrect = total > 0 && correctCount >= total;
    
    if (!allCorrect) {
      // User tried to submit without answering all correctly
      user.gameStatus = "failed";
      await user.save();
      await logEvent("case-submit-failed", { 
        userId: user._id, 
        correctCount, 
        total,
        reason: "Not all questions answered correctly"
      });
      
      // Notify admin of failure
      try {
        const { getIO } = await import("../socket/index.js");
        const io = getIO();
        if (io) {
          io.emit("game-failed", {
            userId: user._id,
            rollNumber: user.rollNumber,
            displayName: user.displayName,
            gameStatus: "failed",
            reason: "Incomplete submission"
          });
        }
      } catch (err) {
        console.error("Socket emit failed:", err);
      }
      
      return res.status(400).json({ 
        ok: false, 
        error: "You couldn't solve the case",
        message: `You answered ${correctCount}/${total} questions correctly. You need all ${total} correct to submit.`,
        correctCount,
        total
      });
    }
    
    // All questions correct - mark game as completed
    user.phase = "complete";
    user.currentPhase = 3; // NUMBER, not string
    user.currentSubphase = 1;
    user.lastVisitedRoute = "/complete";
    user.gameStatus = "completed";
    if (!user.completedAt) {
      user.completedAt = new Date();
    }
    const completionTime = new Date().getTime() - new Date(user.gameStartedAt).getTime();
    await user.save();
    await logEvent("case-submit", { userId: user._id, ok: true, completionTime });
    
    // Emit socket event to admin dashboard so they see real-time update
    try {
      const { getIO } = await import("../socket/index.js");
      const io = getIO();
      if (io) {
        io.emit("game-completed", {
          userId: user._id,
          rollNumber: user.rollNumber,
          displayName: user.displayName,
          completedAt: user.completedAt,
          completionTime: completionTime,
          gameStatus: "completed"
        });
      }
    } catch (err) {
      console.error("Socket emit failed:", err);
    }
    
    res.json({ ok: true, message: "Case submitted successfully!" });
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
    const story = await Story.findById(storyId).select("title description pdfUrl sqliteTemplateId questions");
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
    await logEvent("qr-scan", { userId: user._id, link, ok });
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
    
    // Shuffle questions for random order
    const shuffledQuestions = (story?.questions || [])
      .map((q) => ({ id: q._id, prompt: q.prompt, _sort: Math.random() }))
      .sort((a, b) => a._sort - b._sort)
      .map(({ id, prompt }) => ({ id, prompt }));
    
    res.json({ storyId, questions: shuffledQuestions, correct: user.phase2CorrectQuestions || [] });
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
    // NOTE: Game should only be marked as "completed" when user submits case
    // Here we just track that answers are correct
    // Progress update is handled by Phase2.jsx calling /progress/update endpoint

    res.json({ ok: true, correct, total, correctCount, allCorrect });
  } catch (err) {
    next(err);
  }
};

export const saveProgress = async (req, res, next) => {
  try {
    const user = req.user;
    const { subphase, timeRemaining, timeElapsed, currentPhase, currentSubPhase, lastVisitedRoute } = req.body;

    if (!subphase) {
      return res.status(400).json({ error: "Subphase is required" });
    }

    // Check if this subphase already exists in progressTracking
    const existingIndex = user.progressTracking.findIndex(p => p.subphase === subphase);
    
    const progressEntry = {
      subphase,
      completedAt: new Date(),
      timeRemaining: timeRemaining || 0,
      timeElapsed: timeElapsed || 0
    };

    if (existingIndex >= 0) {
      // Update existing entry
      user.progressTracking[existingIndex] = progressEntry;
    } else {
      // Add new entry
      user.progressTracking.push(progressEntry);
    }

    // Update progress tracking fields
    if (currentPhase) user.currentPhase = currentPhase;
    if (currentSubPhase !== undefined) user.currentSubPhase = currentSubPhase;
    if (lastVisitedRoute) user.lastVisitedRoute = lastVisitedRoute;
    
    // Set startedAt on first progress save if not set
    if (!user.startedAt && user.phase !== "lobby") {
      user.startedAt = new Date();
    }

    await user.save();

    res.json({ ok: true, progressEntry });
  } catch (err) {
    next(err);
  }
};

export const getUserProgress = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      currentPhase: user.currentPhase || user.phase || "lobby",
      currentSubPhase: user.currentSubPhase || null,
      lastVisitedRoute: user.lastVisitedRoute || "/lobby",
      startedAt: user.startedAt,
      completedAt: user.completedAt,
      phase: user.phase,
      gameStatus: user.gameStatus,
      progressTracking: user.progressTracking || []
    });
  } catch (err) {
    next(err);
  }
};

export const endGame = async (req, res, next) => {
  try {
    const user = req.user;
    const { reason } = req.body; // 'timeout' or 'completed'

    // Update game status
    if (reason === "timeout") {
      user.gameStatus = "timeout";
    } else if (reason === "completed") {
      user.gameStatus = "completed";
      if (!user.completedAt) {
        user.completedAt = new Date();
      }
    }

    await user.save();

    // Emit event to admin dashboard so they see real-time update
    try {
      const { getIO } = await import("../socket/index.js");
      const io = getIO();
      if (io) {
        if (reason === "timeout") {
          io.emit("game-timeout", {
            userId: user._id,
            rollNumber: user.rollNumber,
            displayName: user.displayName,
            gameStatus: "timeout",
            timedOutAt: new Date()
          });
        } else if (reason === "completed") {
          io.emit("game-completed", {
            userId: user._id,
            rollNumber: user.rollNumber,
            displayName: user.displayName,
            completedAt: user.completedAt,
            gameStatus: "completed"
          });
        }
      }
    } catch (err) {
      console.error("Socket emit failed:", err);
    }

    res.json({ ok: true, gameStatus: user.gameStatus });
  } catch (err) {
    next(err);
  }
};
export const getGameStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const gameState = await GameState.findOne({ userId: user._id });
    
    // Check config for dynamic default
    let defaultDuration = 1800;
    try {
        const config = await GameConfig.findOne({ configKey: "timer-duration" });
        if (config?.timerDuration) {
            defaultDuration = config.timerDuration;
        }
    } catch(e) {}

    if (!gameState) {
      return res.json({
        status: "not_started",
        startTime: null,
        duration: defaultDuration,
        timeRemaining: defaultDuration
      });
    }

    const now = new Date();
    const elapsed = Math.floor((now - gameState.startTime) / 1000);
    // Use stored duration or fallback to config default
    const currentDuration = gameState.duration || defaultDuration;
    const timeRemaining = Math.max(0, currentDuration - elapsed);

    res.json({
      status: gameState.status,
      startTime: gameState.startTime,
      duration: currentDuration,
      timeRemaining,
      serverTime: now, // Critical for sync
      isExpired: timeRemaining === 0
    });
  } catch (err) {
    next(err);
  }
};