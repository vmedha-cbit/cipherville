// Puzzle configurations for each officer
// Each puzzle defines the 3x3 grid layout
// Layout references ONLY files that actually exist in that puzzle folder
// Files starting with "key_" are interactive slots (shown in side panel)
// Other files (p{number}) are fixed pieces (always shown in grid)

export const puzzleConfigs = {
  puzzle1: {
    layout: ["key_1", "p2", "p3", "key_4", "p5", "p6", "key_7", "p8", "p9"],
    correctKeys: ["key_1", "key_4", "key_7"],
    puzzleFolder: "puzzle1"
  },
  puzzle2: {
    layout: ["p1", "p2", "key_3", "p4", "key_5", "key_6", "p7", "p8", "p9"],
    correctKeys: ["key_3", "key_5", "key_6"],
    puzzleFolder: "puzzle2"
  },
  puzzle3: {
    layout: ["key_1", "key_2", "p3", "key_4", "p5", "p6", "p7", "p8", "p9"],
    correctKeys: ["key_1", "key_2", "key_4"],
    puzzleFolder: "puzzle3"
  },
  puzzle4: {
    layout: ["key_1", "p2", "p3", "key_4", "key_5", "p6", "p7", "p8", "p9"],
    correctKeys: ["key_1", "key_4", "key_5"],
    puzzleFolder: "puzzle4"
  },
  puzzle5: {
    layout: ["key_1", "p2", "p3", "key_4", "p5", "key_6", "p7", "p8", "p9"],
    correctKeys: ["key_1", "key_4", "key_6"],
    puzzleFolder: "puzzle5"
  },
  puzzle6: {
    layout: ["key_1", "p2", "p3", "key_4", "p5", "p6", "key_7", "p8", "p9"],
    correctKeys: ["key_1", "key_4", "key_7"],
    puzzleFolder: "puzzle6"
  },
  puzzle7: {
    layout: ["p1", "p2", "key_3", "p4", "p5", "key_6", "p7", "key_8", "p9"],
    correctKeys: ["key_3", "key_6", "key_8"],
    puzzleFolder: "puzzle7"
  },
  puzzle8: {
    layout: ["p1", "p2", "p3", "key_4", "p5", "p6", "key_7", "key_8", "p9"],
    correctKeys: ["key_4", "key_7", "key_8"],
    puzzleFolder: "puzzle8"
  },
  puzzle9: {
    layout: ["p1", "p2", "p3", "p4", "key_5", "key_6", "p7", "p8", "key_9"],
    correctKeys: ["key_5", "key_6", "key_9"],
    puzzleFolder: "puzzle9"
  },
  puzzle10: {
    layout: ["p1", "p2", "p3", "p4", "key_5", "key_6", "p7", "p8", "key_9"],
    correctKeys: ["key_5", "key_6", "key_9"],
    puzzleFolder: "puzzle10"
  }
};

export const getPuzzleConfig = (puzzleName = "puzzle1") => {
  return puzzleConfigs[puzzleName] || puzzleConfigs.puzzle1;
};
