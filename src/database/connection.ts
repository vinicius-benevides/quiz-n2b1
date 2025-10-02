import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import { applyMigrations } from "./migrations";
import { SQLiteResultSet, SQLiteRow } from "./sqliteTypes";

type SQLiteBindValue = string | number | null | Uint8Array | boolean;

type ExecuteSql = (sql: string, params?: SQLiteBindValue[]) => Promise<[SQLiteResultSet]>;

export type DatabaseConnection = SQLiteDatabase & {
  executeSql: ExecuteSql;
};

const DATABASE_NAME = "quiz.db";

let databaseInstance: DatabaseConnection | null = null;
let databasePromise: Promise<DatabaseConnection> | null = null;
let migrationsPromise: Promise<void> | null = null;

const log = (...messages: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log("[Database]", ...messages);
};

const isSelectStatement = (sql: string) => {
  const trimmed = sql.trim().toLowerCase();
  if (!trimmed) {
    return false;
  }

  const firstWord = trimmed.split(/\s+/, 1)[0];
  return firstWord === "select" || firstWord === "with";
};

const createRowsList = (rows: SQLiteRow[]) => ({
  length: rows.length,
  item: (index: number) => rows[index],
});

async function executeSqlInternal(
  db: SQLiteDatabase,
  sql: string,
  params: SQLiteBindValue[] = []
): Promise<SQLiteResultSet> {
  const normalizedParams = params ?? [];
  if (isSelectStatement(sql)) {
    const resultRows = await db.getAllAsync<SQLiteRow>(sql, normalizedParams as any);

    return {
      rows: createRowsList(resultRows),
      rowsAffected: 0,
    };
  }

  const runResult = await db.runAsync(sql, normalizedParams as any);

  return {
    rows: createRowsList([]),
    rowsAffected: runResult.changes ?? 0,
    insertId: runResult.lastInsertRowId ?? undefined,
  };
}

async function ensureMigrations(db: DatabaseConnection) {
  if (!migrationsPromise) {
    migrationsPromise = (async () => {
      log("Applying migrations...");
      await applyMigrations(db);
      log("Migrations applied successfully");
    })();
  } else {
    log("Awaiting pending migrations");
  }

  return migrationsPromise;
}

async function createDatabase(): Promise<DatabaseConnection> {
  if (!databasePromise) {
    log("Opening new database connection");
    databasePromise = openDatabaseAsync(DATABASE_NAME).then((db) => {
      const connection = db as DatabaseConnection;
      connection.executeSql = async (sql: string, params: SQLiteBindValue[] = []) => {
        const result = await executeSqlInternal(connection, sql, params);
        return [result];
      };
      log("Database opened");
      return connection;
    });
  } else {
    log("Awaiting existing database connection promise");
  }

  const db = await databasePromise;
  await ensureMigrations(db);
  log("Database ready for use");
  databaseInstance = db;
  return db;
}

export async function getDatabase(): Promise<DatabaseConnection> {
  if (databaseInstance) {
    log("Reusing existing database instance");
    await ensureMigrations(databaseInstance);
    return databaseInstance;
  }

  return createDatabase();
}

export async function closeDatabase() {
  if (!databaseInstance) {
    return;
  }

  log("Closing database connection");
  await databaseInstance.closeAsync();
  databaseInstance = null;
  databasePromise = null;
  migrationsPromise = null;
  log("Database connection closed");
}

export async function runInTransaction<T>(callback: (db: DatabaseConnection) => Promise<T>): Promise<T> {
  const db = await getDatabase();
  log("Running callback inside transaction context");
  return callback(db);
}
