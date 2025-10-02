import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DATABASE_NAME = 'quiz.db';
let databaseInstance: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (databaseInstance) {
    return databaseInstance;
  }

  databaseInstance = await SQLite.openDatabase({
    name: DATABASE_NAME,
    location: 'default',
  });

  return databaseInstance;
}

export async function closeDatabase() {
  if (!databaseInstance) {
    return;
  }

  await databaseInstance.close();
  databaseInstance = null;
}

export async function runInTransaction<T>(callback: (db: SQLiteDatabase) => Promise<T>): Promise<T> {
  const db = await getDatabase();
  return callback(db);
}
