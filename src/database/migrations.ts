import { DatabaseConnection } from "./connection";

const statements = [
  `PRAGMA foreign_keys = ON;`,
  `CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,
  `CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme_id INTEGER NOT NULL,
    statement TEXT NOT NULL,
    explanation TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(theme_id) REFERENCES themes(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS alternatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    is_correct INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS idx_question_theme ON questions(theme_id);`,
  `CREATE INDEX IF NOT EXISTS idx_alternative_question ON alternatives(question_id);`
];

export async function applyMigrations(db: DatabaseConnection) {
  for (const statement of statements) {
    await db.executeSql(statement);
  }
}
