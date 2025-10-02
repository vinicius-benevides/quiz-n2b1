export type Theme = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  questionCount?: number;
};

export type NewTheme = Omit<Theme, 'id' | 'questionCount' | 'createdAt'>;
export type UpdateTheme = Partial<Omit<NewTheme, 'name'>> & { name?: string };

export type Question = {
  id: number;
  themeId: number;
  statement: string;
  explanation: string | null;
  createdAt: string;
};

export type NewQuestion = {
  themeId: number;
  statement: string;
  explanation?: string;
  alternatives: NewAlternative[];
};

export type Alternative = {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
};

export type NewAlternative = {
  text: string;
  isCorrect: boolean;
};

export type QuestionWithAlternatives = Question & {
  alternatives: Alternative[];
};

export type QuizQuestionResult = {
  question: QuestionWithAlternatives;
  selectedAlternativeId: number;
  isCorrect: boolean;
};

export type QuizSummary = {
  theme: Theme;
  totalQuestions: number;
  correctAnswers: number;
  results: QuizQuestionResult[];
};
