import { Story } from "../models/Story.js";
import { GameConfig } from "../models/GameConfig.js";

/**
 * Fair story allocation using round-robin shuffled system
 * Ensures equal distribution across all players
 */
export const assignStoryFairly = async () => {
  const configKey = "story-allocation";
  
  // Get or create config
  let config = await GameConfig.findOne({ configKey });
  
  if (!config) {
    // Initialize: Get all stories and shuffle them
    const stories = await Story.find().select("_id");
    if (!stories.length) {
      throw new Error("No stories configured");
    }
    
    // Shuffle stories
    const shuffled = [...stories].sort(() => Math.random() - 0.5);
    
    config = await GameConfig.create({
      configKey,
      storyOrder: shuffled.map(s => s._id),
      currentIndex: 0
    });
  }
  
  // Check if we need to reshuffle (reached end of array)
  if (config.currentIndex >= config.storyOrder.length) {
    // Reshuffle and reset
    const stories = await Story.find().select("_id");
    const shuffled = [...stories].sort(() => Math.random() - 0.5);
    
    config.storyOrder = shuffled.map(s => s._id);
    config.currentIndex = 0;
  }
  
  // Assign story at current index
  const assignedStoryId = config.storyOrder[config.currentIndex];
  
  // Increment index
  config.currentIndex += 1;
  await config.save();
  
  // Verify story still exists
  const story = await Story.findById(assignedStoryId);
  if (!story) {
    // Story was deleted, remove from order and try again
    config.storyOrder = config.storyOrder.filter(id => String(id) !== String(assignedStoryId));
    config.currentIndex = Math.max(0, config.currentIndex - 1);
    await config.save();
    return assignStoryFairly(); // Recursive call
  }
  
  return story;
};
