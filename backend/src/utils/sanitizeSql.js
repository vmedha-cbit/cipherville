const BLOCKED = /(insert|update|delete|drop|alter|create|truncate|attach|detach|pragma|vacuum|reindex|replace)/i;

export const validateSql = (sql) => {
  if (!sql || typeof sql !== "string") {
    return { ok: false, reason: "SQL is required" };
  }
  const trimmed = sql.trim();
  
  // Remove trailing semicolon for validation (users can end queries with ;)
  const cleanedSql = trimmed.endsWith(";") ? trimmed.slice(0, -1).trim() : trimmed;
  
  if (!/^select\b|^with\b/i.test(cleanedSql)) {
    return { ok: false, reason: "Only SELECT or WITH queries are allowed" };
  }
  if (BLOCKED.test(cleanedSql)) {
    return { ok: false, reason: "Destructive keywords are not allowed" };
  }
  
  // Check for multiple actual statements (more than one semicolon or clear separation)
  const statementCount = (trimmed.match(/;/g) || []).length;
  if (statementCount > 1) {
    return { ok: false, reason: "Multiple statements are not allowed - use JOINs or CTEs instead" };
  }
  
  return { ok: true, cleanedSql };
};

