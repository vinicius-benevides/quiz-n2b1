import { QuestionWithAlternatives, QuizQuestionResult, Theme } from '../types';

export type RootStackParamList = {
  Home: undefined;
  Themes: undefined;
  QuestionManagement: { themeId?: number } | undefined;
  QuestionForm: { themeId: number; questionId?: number };
  QuizSetup: undefined;
  QuizPlay: {
    theme: Theme;
    questions: QuestionWithAlternatives[];
  };
  QuizSummary: {
    theme: Theme;
    results: QuizQuestionResult[];
  };
};
