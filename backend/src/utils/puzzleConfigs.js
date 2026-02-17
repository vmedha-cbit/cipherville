// Puzzle configurations for each officer
// Each puzzle defines the 3x3 grid layout and correct key pieces
// Layout positions: 0-8 represent grid cells (top-left to bottom-right)
// MUST MATCH actual files in /public/puzzle/puzzle{number}/ directories

export const puzzleConfigs = {
  puzzle1: {
    layout: ["key_1", "p2", "p3", "key_4", "p5", "p6", "key_7", "p8", "p9"],
    correctKeys: ["key_1", "key_4", "key_7"]
  },
  puzzle2: {
    layout: ["p1", "p2", "key_3", "p4", "key_5", "key_6", "p7", "p8", "p9"],
    correctKeys: ["key_3", "key_5", "key_6"]
  },
  puzzle3: {
    layout: ["key_1", "key_2", "p3", "key_4", "p5", "p6", "p7", "p8", "p9"],
    correctKeys: ["key_1", "key_2", "key_4"]
  },
  puzzle4: {
    layout: ["key_1", "p2", "p3", "key_4", "key_5", "p6", "p7", "p8", "p9"],
    correctKeys: ["key_1", "key_4", "key_5"]
  },
  puzzle5: {
    layout: ["key_1", "p2", "p3", "key_4", "p5", "key_6", "p7", "p8", "p9"],
    correctKeys: ["key_1", "key_4", "key_6"]
  },
  puzzle6: {
    layout: ["key_1", "p2", "p3", "key_4", "p5", "p6", "key_7", "p8", "p9"],
    correctKeys: ["key_1", "key_4", "key_7"]
  },
  puzzle7: {
    layout: ["p1", "p2", "key_3", "p4", "p5", "key_6", "p7", "key_8", "p9"],
    correctKeys: ["key_3", "key_6", "key_8"]
  },
  puzzle8: {
    layout: ["p1", "p2", "p3", "key_4", "p5", "p6", "key_7", "key_8", "p9"],
    correctKeys: ["key_4", "key_7", "key_8"]
  },
  puzzle9: {
    layout: ["p1", "p2", "p3", "p4", "key_5", "key_6", "p7", "p8", "key_9"],
    correctKeys: ["key_5", "key_6", "key_9"]
  },
  puzzle10: {
    layout: ["p1", "p2", "p3", "p4", "key_5", "key_6", "p7", "p8", "key_9"],
    correctKeys: ["key_5", "key_6", "key_9"]
  },
  
  puzzle12: {
    layout: ["p1", "p2", "p3", "p4", "key_5", "p6", "key_7", "key_8", "p9"],
    correctKeys: ["key_5", "key_7", "key_8"]
  }
};

export const getPuzzleConfig = (puzzleFolder = "puzzle1") => {
  return puzzleConfigs[puzzleFolder] || puzzleConfigs.puzzle1;
};
