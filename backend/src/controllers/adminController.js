import { Officer } from "../models/Officer.js";
import { Story } from "../models/Story.js";
import { User } from "../models/User.js";
import { GameConfig } from "../models/GameConfig.js";

export const createOfficer = async (req, res, next) => {
  try {
    const officer = await Officer.create(req.body || {});
    res.json(officer);
  } catch (err) {
    next(err);
  }
};

export const listOfficers = async (req, res, next) => {
  try {
    const officers = await Officer.find().sort({ createdAt: -1 });
    res.json(officers);
  } catch (err) {
    next(err);
  }
};

export const updateOfficer = async (req, res, next) => {
  try {
    const officer = await Officer.findByIdAndUpdate(req.params.officerId, req.body || {}, { new: true });
    if (!officer) {
      return res.status(404).json({ error: "Officer not found" });
    }
    res.json(officer);
  } catch (err) {
    next(err);
  }
};

export const deleteOfficer = async (req, res, next) => {
  try {
    const officer = await Officer.findByIdAndDelete(req.params.officerId);
    if (!officer) {
      return res.status(404).json({ error: "Officer not found" });
    }
    res.json({ ok: true, message: "Officer deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const dashboard = async (req, res, next) => {
  try {
    const [users, stories, officers] = await Promise.all([
      User.find().sort({ createdAt: -1 }).select("rollNumber displayName phase gameStatus gameStartedAt timerDuration completedAt startedAt progressTracking attempts"),
      Story.find().sort({ createdAt: -1 }).limit(10),
      Officer.find().sort({ createdAt: -1 }).limit(10)
    ]);
    
    // Add timer info and completion type to each user
    const usersWithTimer = users.map(user => {
      const userObj = user.toObject();
      
      // Calculate timer info
      if (user.gameStartedAt && user.gameStatus === "playing") {
        const now = new Date();
        const startedAt = new Date(user.gameStartedAt);
        const elapsed = Math.floor((now - startedAt) / 1000);
        const duration = user.timerDuration || 1800;
        userObj.timeRemaining = Math.max(0, duration - elapsed);
        userObj.isExpired = userObj.timeRemaining === 0;
        userObj.isPanic = userObj.timeRemaining > 0 && userObj.timeRemaining <= 300;
      } else {
        userObj.timeRemaining = null;
        userObj.isExpired = false;
        userObj.isPanic = false;
      }
      
      // Calculate completion type and time
      if (user.completedAt) {
        userObj.completionTime = new Date(user.completedAt) - new Date(user.startedAt);
        userObj.completionType = "completed";
      } else if (user.gameStatus === "timeout") {
        userObj.completionType = "timeout";
        userObj.completionTime = null;
      } else if (user.gameStatus === "playing") {
        userObj.completionType = "in-progress";
        userObj.completionTime = null;
      } else {
        userObj.completionType = "partial";
        userObj.completionTime = null;
      }
      
      return userObj;
    });
    
    res.json({ users: usersWithTimer, stories, officers });
  } catch (err) {
    next(err);
  }
};

export const seedOfficers = async (req, res, next) => {
  try {
    // Officer data to seed
    const officersData = [
      {
        "name": "Raghav Mehta",
        "dob": "10071989",
        "jumbledWord": "TATINOSB",
        "answer": "STATION",
        "puzzleFolder": "puzzle1",
        "routeOptions": [
          { "label": "Metro", "content": "Red line diverges at district", "isCorrect": false },
          { "label": "Harbor", "content": "Station near the docks", "isCorrect": true },
          { "label": "Hill", "content": "Mountain rail terminus", "isCorrect": false }
        ]
      },
      {
        "name": "Arjun Malhotra",
        "dob": "21031992",
        "jumbledWord": "REVRES",
        "answer": "SERVER",
        "puzzleFolder": "puzzle2",
        "routeOptions": [
          { "label": "Metro", "content": "Tech hub data center", "isCorrect": true },
          { "label": "Harbor", "content": "Shipping container logs", "isCorrect": false },
          { "label": "Hill", "content": "Wireless tower location", "isCorrect": false }
        ]
      },
      {
        "name": "Kiran Rao",
        "dob": "05011990",
        "jumbledWord": "YREUQ",
        "answer": "QUERY",
        "puzzleFolder": "puzzle3",
        "routeOptions": [
          { "label": "Metro", "content": "Subway interview witness", "isCorrect": false },
          { "label": "Harbor", "content": "Harbor master inquiry", "isCorrect": true },
          { "label": "Hill", "content": "Mountain village records", "isCorrect": false }
        ]
      },
      {
        "name": "Suresh Iyer",
        "dob": "18081988",
        "jumbledWord": "ATADABES",
        "answer": "DATABASE",
        "puzzleFolder": "puzzle4",
        "routeOptions": [
          { "label": "Metro", "content": "Underground archives", "isCorrect": true },
          { "label": "Harbor", "content": "Port registry files", "isCorrect": false },
          { "label": "Hill", "content": "Observatory records", "isCorrect": false }
        ]
      },
      {
        "name": "Nikhil Verma",
        "dob": "27021991",
        "jumbledWord": "ECNEDIVE",
        "answer": "EVIDENCE",
        "puzzleFolder": "puzzle5",
        "routeOptions": [
          { "label": "Metro", "content": "Station security footage", "isCorrect": false },
          { "label": "Harbor", "content": "Coastal evidence locker", "isCorrect": true },
          { "label": "Hill", "content": "Remote cabin artifacts", "isCorrect": false }
        ]
      },
      {
        "name": "Amit Kulkarni",
        "dob": "14061987",
        "jumbledWord": "CITROENSF",
        "answer": "FORENSIC",
        "puzzleFolder": "puzzle6",
        "routeOptions": [
          { "label": "Metro", "content": "Crime lab downtown", "isCorrect": true },
          { "label": "Harbor", "content": "Maritime investigation unit", "isCorrect": false },
          { "label": "Hill", "content": "Wilderness tracking station", "isCorrect": false }
        ]
      },
      {
        "name": "Vikas Sharma",
        "dob": "09041993",
        "jumbledWord": "ATAD",
        "answer": "DATA",
        "puzzleFolder": "puzzle7",
        "routeOptions": [
          { "label": "Metro", "content": "Train system logs", "isCorrect": true },
          { "label": "Harbor", "content": "Cargo shipping data", "isCorrect": false },
          { "label": "Hill", "content": "Survey measurements", "isCorrect": false }
        ]
      },
      {
        "name": "Pranav Desai",
        "dob": "30091986",
        "jumbledWord": "KCATNART",
        "answer": "TRACKANT",
        "puzzleFolder": "puzzle8",
        "routeOptions": [
          { "label": "Metro", "content": "Track maintenance crew", "isCorrect": true },
          { "label": "Harbor", "content": "Shipping route records", "isCorrect": false },
          { "label": "Hill", "content": "Trail system maps", "isCorrect": false }
        ]
      },
      {
        "name": "Rahul Sengupta",
        "dob": "16051994",
        "jumbledWord": "TSOP",
        "answer": "POST",
        "puzzleFolder": "puzzle9",
        "routeOptions": [
          { "label": "Metro", "content": "Central mail facility", "isCorrect": true },
          { "label": "Harbor", "content": "International mail terminal", "isCorrect": false },
          { "label": "Hill", "content": "Rural postal station", "isCorrect": false }
        ]
      },
      {
        "name": "Manish Choudhary",
        "dob": "23121985",
        "jumbledWord": "GOL",
        "answer": "LOG",
        "puzzleFolder": "puzzle10",
        "routeOptions": [
          { "label": "Metro", "content": "Logging terminal data", "isCorrect": true },
          { "label": "Harbor", "content": "Timber port records", "isCorrect": false },
          { "label": "Hill", "content": "Forest logging site", "isCorrect": false }
        ]
      }
    ];

    // Clear existing officers
    await Officer.deleteMany({});

    // Seed new officers
    const seededOfficers = await Officer.insertMany(officersData);

    res.json({
      ok: true,
      count: seededOfficers.length,
      message: `${seededOfficers.length} officers seeded successfully`
    });
  } catch (err) {
    next(err);
  }
};

export const seedDemoData = async (req, res, next) => {
  try {
    const existing = await Story.findOne({ title: "The Cipher Heist" });
    if (existing) {
      return res.json({ ok: true, storyId: existing._id, message: "Demo data already exists" });
    }

    const story = await Story.create({
      title: "The Cipher Heist",
      reportText: "A sequence of encrypted messages led to a data breach.",
      evidenceDescription: "Analyze comms, IP logs, and badge access records.",
      sqliteTemplateId: "cipher-heist"
    });

    const officer = await Officer.create({
      name: "Officer Neel Shah",
      dob: "12041995",
      background: "Cybercrime unit, known for pattern analysis.",
      lastCase: "Operation Glass Veil",
      articleText: "A local newspaper mentions Neel's birthday on the 12th.",
      qrLinks: [
        "/qr/qr-1.svg",
        "/qr/qr-2.svg",
        "/qr/qr-3.svg",
        "/qr/qr-4.svg",
        "/qr/qr-5.svg",
        "/qr/qr-6.svg",
        "/qr/qr-7.svg",
        "/qr/qr-8.svg",
        "/qr/qr-9.svg",
        "/qr/qr-10.svg"
      ],
      puzzlePieces: [
        { id: "p1", x: 40, y: 40 },
        { id: "p2", x: 120, y: 40 },
        { id: "p3", x: 40, y: 120 },
        { id: "p4", x: 120, y: 120 }
      ],
      jumbledWord: "EVIDENCE",
      routeOptions: [
        { label: "Metro", content: "Fake trail", isCorrect: false },
        { label: "Harbor", content: "Clue: 1995", isCorrect: true },
        { label: "Hill", content: "Fake trail", isCorrect: false }
      ],
      storyId: story._id
    });

    res.json({
      ok: true,
      storyId: story._id,
      officerId: officer._id,
      sqliteTemplateId: story.sqliteTemplateId
    });
  } catch (err) {
    next(err);
  }
};

export const getFastestSolvers = async (req, res, next) => {
  try {
    // Find users who have completed the game (completedAt is not null)
    const completedUsers = await User.find({
      completedAt: { $ne: null },
      startedAt: { $ne: null }
    })
      .populate("phase2Story", "title")
      .select("rollNumber displayName phase2Story startedAt completedAt");

    // Calculate completion time and prepare data
    const solvers = completedUsers
      .map((user) => {
        const completionTime = new Date(user.completedAt) - new Date(user.startedAt);
        return {
          _id: user._id,
          rollNumber: user.rollNumber,
          displayName: user.displayName,
          storyTitle: user.phase2Story?.title || "Unknown",
          startedAt: user.startedAt,
          completedAt: user.completedAt,
          completionTime: completionTime
        };
      })
      .filter((solver) => solver.completionTime > 0) // Filter out invalid times
      .sort((a, b) => a.completionTime - b.completionTime); // Sort ascending by completion time

    res.json({ solvers });
  } catch (err) {
    next(err);
  }
};

export const getTimerDuration = async (req, res, next) => {
  try {
    let config = await GameConfig.findOne({ configKey: "timer-duration" });
    if (!config) {
      // Create default config if it doesn't exist
      config = await GameConfig.create({
        configKey: "timer-duration",
        timerDuration: 1800 // Default 30 minutes
      });
    }
    res.json({ timerDuration: config.timerDuration });
  } catch (err) {
    next(err);
  }
};

export const setTimerDuration = async (req, res, next) => {
  try {
    const { timerDuration } = req.body || {};
    if (!timerDuration || timerDuration < 60) {
      return res.status(400).json({ error: "Timer duration must be at least 60 seconds (1 minute)" });
    }
    
    let config = await GameConfig.findOne({ configKey: "timer-duration" });
    if (!config) {
      config = await GameConfig.create({
        configKey: "timer-duration",
        timerDuration: timerDuration
      });
    } else {
      config.timerDuration = timerDuration;
      await config.save();
    }
    
    res.json({ ok: true, timerDuration: config.timerDuration });
  } catch (err) {
    next(err);
  }
};

export const deleteAllUsers = async (req, res, next) => {
  try {
    const result = await User.deleteMany({});
    res.json({ 
      ok: true, 
      message: `${result.deletedCount} user records deleted successfully`
    });
  } catch (err) {
    next(err);
  }
};
