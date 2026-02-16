import { runUserQuery, getTemplateSchema } from "../services/sqliteService.js";
import { logEvent } from "../services/logService.js";

export const runQuery = async (req, res, next) => {
  try {
    const user = req.user;
    const { storyId, sql } = req.body || {};
    if (!storyId || !sql) {
      return res.status(400).json({ error: "storyId and sql required" });
    }
    const result = runUserQuery(storyId, user._id, sql);
    user.attempts.sqlQueries += 1;
    await user.save();
    await logEvent("sql-query", { userId: user._id, roomId: user.roomId });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getSchema = async (req, res, next) => {
  try {
    const { storyId } = req.query || {};
    if (!storyId) {
      return res.status(400).json({ error: "storyId required" });
    }
    const schema = getTemplateSchema(storyId);
    res.json(schema);
  } catch (err) {
    next(err);
  }
};
