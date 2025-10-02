import { ResultSet } from 'react-native-sqlite-storage';
import { getDatabase } from '../connection';
import { NewTheme, Theme } from '../../types';

const mapThemeRow = (row: any): Theme => ({
  id: row.id,
  name: row.name,
  description: row.description,
  color: row.color,
  createdAt: row.created_at,
  questionCount: row.questionCount ?? row.question_count ?? row.count ?? 0,
});

const getRows = (resultSet: ResultSet) => {
  const items: any[] = [];
  for (let index = 0; index < resultSet.rows.length; index += 1) {
    items.push(resultSet.rows.item(index));
  }
  return items;
};

export async function listThemes(): Promise<Theme[]> {
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

  return getRows(result).map(mapThemeRow);
}

export async function createTheme(theme: NewTheme): Promise<Theme> {
  const db = await getDatabase();
  const color = theme.color || '#7C4DFF';

  const [result] = await db.executeSql(
    `INSERT INTO themes (name, description, color)
     VALUES (?, ?, ?);`,
    [theme.name.trim(), theme.description ?? null, color]
  );

  const insertedId = result.insertId;
  const [selectResult] = await db.executeSql(
    `SELECT * FROM themes WHERE id = ?;`,
    [insertedId]
  );

  const row = selectResult.rows.item(0);
  return mapThemeRow(row);
}

export async function updateTheme(id: number, theme: Partial<NewTheme>): Promise<void> {
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
    return;
  }

  values.push(String(id));

  await db.executeSql(
    `UPDATE themes SET ${fields.join(', ')} WHERE id = ?;`,
    values
  );
}

export async function deleteTheme(id: number): Promise<void> {
  const db = await getDatabase();
  await db.executeSql(`DELETE FROM themes WHERE id = ?;`, [id]);
}

export async function getTheme(id: number): Promise<Theme | null> {
  const db = await getDatabase();
  const [result] = await db.executeSql(`SELECT * FROM themes WHERE id = ?;`, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapThemeRow(result.rows.item(0));
}
