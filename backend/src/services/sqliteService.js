import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { ensureSqliteDirs, getTemplateSqlitePath, getUserSqlitePath } from "../config/sqlite.js";
import { validateSql } from "../utils/sanitizeSql.js";

export const runUserQuery = (storyId, userId, sql) => {
  ensureSqliteDirs();
  const templatePath = getTemplateSqlitePath(storyId);
  if (!fs.existsSync(templatePath)) {
    throw new Error("SQLite template not found");
  }

  const userDbPath = getUserSqlitePath(storyId, userId);
  if (!fs.existsSync(userDbPath)) {
    fs.copyFileSync(templatePath, userDbPath);
  }

  const check = validateSql(sql);
  if (!check.ok) {
    const err = new Error(check.reason);
    err.status = 400;
    throw err;
  }

  const db = new Database(userDbPath, { readonly: false });
  try {
    // Use cleanedSql (with trailing semicolon removed) for execution
    const sqlToRun = check.cleanedSql || sql;
    const stmt = db.prepare(sqlToRun);
    const rows = stmt.all();
    const columns = rows.length ? Object.keys(rows[0]) : [];
    return { columns, rows };
  } finally {
    db.close();
  }
};

export const saveTemplateSqlite = (storyId, filePath) => {
  ensureSqliteDirs();
  const targetPath = getTemplateSqlitePath(storyId);
  fs.copyFileSync(filePath, targetPath);
  return path.basename(targetPath);
};

export const getTemplateSchema = (storyId) => {
  ensureSqliteDirs();
  const templatePath = getTemplateSqlitePath(storyId);
  if (!fs.existsSync(templatePath)) {
    throw new Error("SQLite template not found");
  }

  const db = new Database(templatePath, { readonly: true });
  try {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all()
      .map((row) => row.name);

    const schema = tables.map((table) => {
      const safeTable = table.replace(/"/g, "\"\"");
      const columns = db
        .prepare(`PRAGMA table_info("${safeTable}")`)
        .all()
        .map((col) => ({
          name: col.name,
          type: col.type,
          notnull: Boolean(col.notnull),
          pk: Boolean(col.pk)
        }));
      return { name: table, columns };
    });

    return { tables: schema };
  } finally {
    db.close();
  }
};
