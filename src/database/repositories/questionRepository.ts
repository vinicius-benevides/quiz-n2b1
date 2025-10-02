import { getDatabase } from '../connection';
import { Alternative, NewAlternative, NewQuestion, Question, QuestionWithAlternatives } from '../../types';

const mapQuestionRow = (row: any): Question => ({
  id: row.id,
  themeId: row.theme_id,
  statement: row.statement,
  explanation: row.explanation,
  createdAt: row.created_at,
});

const mapAlternativeRow = (row: any): Alternative => ({
  id: row.id,
  questionId: row.question_id,
  text: row.text,
  isCorrect: row.is_correct === 1,
});

function ensureAlternatives(variants: NewAlternative[]) {
  if (variants.length !== 4) {
    throw new Error('Cada pergunta deve possuir exatamente quatro alternativas.');
  }

  const correctCount = variants.filter((variant) => variant.isCorrect).length;

  if (correctCount !== 1) {
    throw new Error('Informe exatamente uma alternativa correta.');
  }
}

export async function listQuestionsByTheme(themeId: number): Promise<QuestionWithAlternatives[]> {
  const db = await getDatabase();

  const [questionsResult] = await db.executeSql(
    `SELECT * FROM questions WHERE theme_id = ? ORDER BY created_at DESC;`,
    [themeId]
  );

  const questions: Question[] = [];
  for (let index = 0; index < questionsResult.rows.length; index += 1) {
    questions.push(mapQuestionRow(questionsResult.rows.item(index)));
  }

  if (questions.length === 0) {
    return [];
  }

  const ids = questions.map((question) => question.id);
  const placeholders = ids.map(() => '?').join(',');

  const [alternativesResult] = await db.executeSql(
    `SELECT * FROM alternatives WHERE question_id IN (${placeholders}) ORDER BY id ASC;`,
    ids
  );

  const alternativesMap = new Map<number, Alternative[]>();
  for (let index = 0; index < alternativesResult.rows.length; index += 1) {
    const row = alternativesResult.rows.item(index);
    const alternative = mapAlternativeRow(row);
    const bucket = alternativesMap.get(alternative.questionId) ?? [];
    bucket.push(alternative);
    alternativesMap.set(alternative.questionId, bucket);
  }

  return questions.map((question) => ({
    ...question,
    alternatives: alternativesMap.get(question.id) ?? [],
  }));
}

export async function createQuestion(payload: NewQuestion): Promise<QuestionWithAlternatives> {
  ensureAlternatives(payload.alternatives);

  const db = await getDatabase();

  await db.executeSql('BEGIN TRANSACTION;');

  try {
    const [insertResult] = await db.executeSql(
      `INSERT INTO questions (theme_id, statement, explanation) VALUES (?, ?, ?);`,
      [payload.themeId, payload.statement.trim(), payload.explanation ?? null]
    );

    const insertedId = insertResult.insertId;
    if (insertedId === undefined) {
      throw new Error('Failed to retrieve the inserted question id.');
    }

    for (const alternative of payload.alternatives) {
      await db.executeSql(
        `INSERT INTO alternatives (question_id, text, is_correct) VALUES (?, ?, ?);`,
        [insertedId, alternative.text.trim(), alternative.isCorrect ? 1 : 0]
      );
    }

    await db.executeSql('COMMIT;');

    return (await getQuestionWithAlternatives(insertedId))!;
  } catch (error) {
    await db.executeSql('ROLLBACK;');
    throw error;
  }
}

export async function updateQuestion(
  id: number,
  payload: { statement?: string; explanation?: string | null; alternatives?: Array<NewAlternative & { id?: number }> }
): Promise<void> {
  const db = await getDatabase();

  await db.executeSql('BEGIN TRANSACTION;');

  try {
    if (payload.statement !== undefined || payload.explanation !== undefined) {
      const fields: string[] = [];
      const values: Array<string | number | null> = [];

      if (payload.statement !== undefined) {
        fields.push('statement = ?');
        values.push(payload.statement.trim());
      }

      if (payload.explanation !== undefined) {
        fields.push('explanation = ?');
        values.push(payload.explanation ?? null);
      }

      if (fields.length) {
        values.push(id);
        await db.executeSql(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?;`, values);
      }
    }

    if (payload.alternatives) {
      ensureAlternatives(payload.alternatives);
      await db.executeSql(`DELETE FROM alternatives WHERE question_id = ?;`, [id]);

      for (const alternative of payload.alternatives) {
        await db.executeSql(
          `INSERT INTO alternatives (question_id, text, is_correct) VALUES (?, ?, ?);`,
          [id, alternative.text.trim(), alternative.isCorrect ? 1 : 0]
        );
      }
    }

    await db.executeSql('COMMIT;');
  } catch (error) {
    await db.executeSql('ROLLBACK;');
    throw error;
  }
}

export async function deleteQuestion(id: number): Promise<void> {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM questions WHERE id = ?;', [id]);
}

export async function getQuestionWithAlternatives(id: number): Promise<QuestionWithAlternatives | null> {
  const db = await getDatabase();

  const [questionResult] = await db.executeSql('SELECT * FROM questions WHERE id = ?;', [id]);
  if (questionResult.rows.length === 0) {
    return null;
  }

  const question = mapQuestionRow(questionResult.rows.item(0));

  const [alternativesResult] = await db.executeSql(
    'SELECT * FROM alternatives WHERE question_id = ? ORDER BY id ASC;',
    [id]
  );

  const alternatives: Alternative[] = [];
  for (let index = 0; index < alternativesResult.rows.length; index += 1) {
    alternatives.push(mapAlternativeRow(alternativesResult.rows.item(index)));
  }

  return {
    ...question,
    alternatives,
  };
}
