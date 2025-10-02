import { getDatabase } from './connection';
import { applyMigrations } from './migrations';

let initialized = false;

export async function initializeDatabase() {
  if (initialized) {
    return;
  }

  const db = await getDatabase();
  await applyMigrations(db);
  initialized = true;
}

export * from './connection';
export * from './repositories/themeRepository';
export * from './repositories/questionRepository';
export * from './repositories/quizRepository';
