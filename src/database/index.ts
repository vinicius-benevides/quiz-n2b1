import { getDatabase } from "./connection";

let initialized = false;

export async function initializeDatabase() {
  if (initialized) {
    return;
  }

  await getDatabase();
  initialized = true;
}

export * from "./connection";
export * from "./repositories/themeRepository";
export * from "./repositories/questionRepository";
export * from "./repositories/quizRepository";
export * from "./errors";
