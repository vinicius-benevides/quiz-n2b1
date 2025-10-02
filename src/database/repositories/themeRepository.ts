import { SQLiteResultSet } from '../sqliteTypes';
import { ThemeNameConflictError } from '../errors';
import { getDatabase } from '../connection';
import { NewTheme, Theme } from '../../types';

const log = (...messages: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log('[ThemeRepository]', ...messages);
};

const mapThemeRow = (row: any): Theme => ({
  id: row.id,
  name: row.name,
  description: row.description,
  color: row.color,
  createdAt: row.created_at,
  questionCount: row.questionCount ?? row.question_count ?? row.count ?? 0,
});

const getRows = (resultSet: SQLiteResultSet) => {
  const items: any[] = [];
  for (let index = 0; index < resultSet.rows.length; index += 1) {
    items.push(resultSet.rows.item(index));
  }
  return items;
};

export async function listThemes(): Promise<Theme[]> {
  log('Fetching themes from database');
  const db = await getDatabase();
  const [result] = await db.executeSql(
    `SELECT t.*, IFNULL(q.count, 0) as questionCount
     FROM themes t
     LEFT JOIN (
        SELECT theme_id, COUNT(*) as count
        FROM questions
        GROUP BY theme_id
     ) q ON q.theme_id = t.id
     ORDER BY t.name COLLATE NOCASE;`
  );

  const themes = getRows(result).map(mapThemeRow);
  log(`Fetched ${themes.length} theme(s)`);
  return themes;
}

const isUniqueNameError = (error: unknown) => error instanceof Error && /UNIQUE constraint failed: themes\.name/.test(error.message);

export async function createTheme(theme: NewTheme): Promise<Theme> {
  log('Creating theme with data', theme);
  const db = await getDatabase();
  log('Using database instance', db ? 'available' : 'null');
  const color = theme.color || '#7C4DFF';

  try {
    const [result] = await db.executeSql(
      `INSERT INTO themes (name, description, color)
       VALUES (?, ?, ?);`,
      [theme.name.trim(), theme.description ?? null, color]
    );

    const insertedId = result.insertId;
    if (insertedId === undefined) {
      throw new Error('Failed to retrieve the inserted theme id.');
    }

    log('Theme inserted with id', insertedId);

    const [selectResult] = await db.executeSql(
      `SELECT * FROM themes WHERE id = ?;`,
      [insertedId]
    );

    const row = selectResult.rows.item(0);
    const mappedTheme = mapThemeRow(row);
    log('Loaded inserted theme', mappedTheme);
    return mappedTheme;
  } catch (error) {
    if (isUniqueNameError(error)) {
      log('Theme name already exists', theme.name.trim());
      throw new ThemeNameConflictError(theme.name.trim());
    }

    console.error('[ThemeRepository] Failed to create theme', error, error instanceof Error ? error.stack : null);
    throw error;
  }
}

export async function updateTheme(id: number, theme: Partial<NewTheme>): Promise<void> {
  log('Updating theme', id, 'with data', theme);
  const db = await getDatabase();

  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (theme.name !== undefined) {
    fields.push('name = ?');
    values.push(theme.name.trim());
  }
  if (theme.description !== undefined) {
    fields.push('description = ?');
    values.push(theme.description ?? null);
  }
  if (theme.color !== undefined) {
    fields.push('color = ?');
    values.push(theme.color);
  }

  if (fields.length === 0) {
    log('No fields to update for theme', id);
    return;
  }

  values.push(String(id));

  try {
    await db.executeSql(
      `UPDATE themes SET ${fields.join(', ')} WHERE id = ?;`,
      values
    );
    log('Theme updated successfully', id);
  } catch (error) {
    if (isUniqueNameError(error)) {
      log('Theme name already exists on update', theme.name?.trim() ?? '');
      throw new ThemeNameConflictError((theme.name ?? '').trim());
    }

    console.error('[ThemeRepository] Failed to update theme', error, error instanceof Error ? error.stack : null);
    throw error;
  }
}

export async function deleteTheme(id: number): Promise<void> {
  log('Deleting theme', id);
  const db = await getDatabase();
  await db.executeSql(`DELETE FROM themes WHERE id = ?;`, [id]);
  log('Theme deleted', id);
}

export async function getTheme(id: number): Promise<Theme | null> {
  log('Fetching theme by id', id);
  const db = await getDatabase();
  const [result] = await db.executeSql(`SELECT * FROM themes WHERE id = ?;`, [id]);

  if (result.rows.length === 0) {
    log('No theme found for id', id);
    return null;
  }

  const theme = mapThemeRow(result.rows.item(0));
  log('Found theme', theme);
  return theme;
}
