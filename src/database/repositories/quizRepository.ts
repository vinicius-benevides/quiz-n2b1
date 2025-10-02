import { getDatabase } from '../connection';
import { Alternative, QuestionWithAlternatives } from '../../types';

type QuestionRow = {
  id: number;
  theme_id: number;
  statement: string;
  explanation: string | null;
  created_at: string;
};

type AlternativeRow = {
  id: number;
  question_id: number;
  text: string;
  is_correct: number;
};

const mapQuestionRow = (row: QuestionRow) => ({
  id: row.id,
  themeId: row.theme_id,
  statement: row.statement,
  explanation: row.explanation,
  createdAt: row.created_at,
});

const mapAlternativeRow = (row: AlternativeRow): Alternative => ({
  id: row.id,
  questionId: row.question_id,
  text: row.text,
  isCorrect: row.is_correct === 1,
});

export async function getQuestionCountByTheme(themeId: number): Promise<number> {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    `SELECT COUNT(*) as total FROM questions WHERE theme_id = ?;`,
    [themeId]
  );

  if (result.rows.length === 0) {
    return 0;
  }

  return result.rows.item(0).total ?? 0;
}

export async function pickRandomQuestions(themeId: number, amount: number): Promise<QuestionWithAlternatives[]> {
  const db = await getDatabase();

  const [questionResult] = await db.executeSql(
    `SELECT * FROM questions WHERE theme_id = ? ORDER BY RANDOM() LIMIT ?;`,
    [themeId, amount]
  );

  const questions: QuestionWithAlternatives[] = [];
  const questionMap = new Map<number, QuestionWithAlternatives>();
  const questionIds: number[] = [];

  for (let index = 0; index < questionResult.rows.length; index += 1) {
    const row = questionResult.rows.item(index) as QuestionRow;
    const question = { ...mapQuestionRow(row), alternatives: [] as Alternative[] };
    questions.push(question);
    questionMap.set(question.id, question);
    questionIds.push(question.id);
  }

  if (questionIds.length === 0) {
    return [];
  }

  const placeholders = questionIds.map(() => '?').join(',');
  const [alternativesResult] = await db.executeSql(
    `SELECT * FROM alternatives WHERE question_id IN (${placeholders}) ORDER BY question_id, id;`,
    questionIds
  );

  for (let index = 0; index < alternativesResult.rows.length; index += 1) {
    const row = alternativesResult.rows.item(index) as AlternativeRow;
    const alternative = mapAlternativeRow(row);
    const bucket = questionMap.get(alternative.questionId);
    if (bucket) {
      bucket.alternatives.push(alternative);
    }
  }

  return questions;
}
