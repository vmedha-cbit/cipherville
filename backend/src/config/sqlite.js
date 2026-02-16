import fs from "fs";
import path from "path";
import { env } from "./env.js";

export const ensureSqliteDirs = () => {
  [env.SQLITE_TEMPLATE_DIR, env.SQLITE_USER_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

export const getUserSqlitePath = (storyId, userId) => {
  const safeStory = String(storyId);
  const safeUser = String(userId);
  return path.join(env.SQLITE_USER_DIR, `${safeStory}-${safeUser}.db`);
};

export const getTemplateSqlitePath = (storyId) => {
  const safeStory = String(storyId);
  return path.join(env.SQLITE_TEMPLATE_DIR, `${safeStory}.db`);
};
