import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { palette, radius, spacing, typography } from '../theme';
import { QuizQuestionResult } from '../types';
import { RootStackParamList } from '../navigation/types';

const animationConfig = {
  duration: 300,
  useNativeDriver: true,
};

const QuizPlayScreen = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'QuizPlay'>) => {
  const { questions, theme } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizQuestionResult[]>([]);
  const [locked, setLocked] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const progress = (currentIndex + 1) / questions.length;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { ...animationConfig, toValue: 1 }).start();
  }, [currentIndex, fade]);

  const answerForQuestion = answers.find((item) => item.question.id === currentQuestion.id);

  const handleSelect = (alternativeId: number) => {
    if (locked || answerForQuestion) {
      return;
    }

    setLocked(true);

    const alternative = currentQuestion.alternatives.find((item) => item.id === alternativeId);
    const isCorrect = alternative?.isCorrect ?? false;

    const newAnswer: QuizQuestionResult = {
      question: currentQuestion,
      selectedAlternativeId: alternativeId,
      isCorrect,
    };

    setAnswers((prev) => [...prev, newAnswer]);
  };

  const handleNext = () => {
    if (!answerForQuestion) {
      return;
    }

    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      navigation.replace('QuizSummary', {
        theme,
        results: answers,
      });
    } else {
      setCurrentIndex((value) => value + 1);
      setLocked(false);
    }
  };

  return (
    <Screen scrollable={false}>
      <Header
        title={theme.name}
        subtitle={`Pergunta ${currentIndex + 1} de ${questions.length}`}
        right={<ProgressBar progress={progress} />}
      />

      <Animated.View
        style={[
          styles.questionWrapper,
          {
            opacity: fade,
            transform: [
              {
                translateY: fade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Card>
          <Text style={styles.statement}>{currentQuestion.statement}</Text>
          {currentQuestion.explanation ? (
            <Text style={styles.explanation}>{currentQuestion.explanation}</Text>
          ) : null}
        </Card>

        <View style={styles.alternatives}>
          {currentQuestion.alternatives.map((alternative, index) => {
            const isSelected = answerForQuestion?.selectedAlternativeId === alternative.id;
            const showCorrect = answerForQuestion && alternative.isCorrect;
            const showWrong = isSelected && !alternative.isCorrect;

            return (
              <TouchableOpacity
                key={alternative.id}
                style={[
                  styles.alternativeCard,
                  showCorrect ? styles.correctAlternative : null,
                  showWrong ? styles.wrongAlternative : null,
                ]}
                activeOpacity={0.85}
                onPress={() => handleSelect(alternative.id)}
                disabled={!!answerForQuestion}
              >
                <View style={styles.alternativeIndex}>
                  <Text style={styles.alternativeIndexLabel}>{String.fromCharCode(65 + index)}</Text>
                </View>
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeText}>{alternative.text}</Text>
                  {showCorrect ? <Text style={styles.feedback}>Resposta correta</Text> : null}
                  {showWrong ? <Text style={[styles.feedback, styles.feedbackWrong]}>Resposta incorreta</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Button
          title={currentIndex === questions.length - 1 ? 'Finalizar' : 'Proxima'}
          onPress={handleNext}
          disabled={!answerForQuestion}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  questionWrapper: {
    flex: 1,
    gap: spacing.lg,
  },
  statement: {
    ...typography.subtitle,
    fontSize: 20,
    color: palette.text,
  },
  explanation: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  alternatives: {
    gap: spacing.md,
  },
  alternativeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  correctAlternative: {
    borderColor: palette.success,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  wrongAlternative: {
    borderColor: palette.danger,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  alternativeIndex: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternativeIndexLabel: {
    ...typography.subtitle,
    fontSize: 16,
    color: palette.text,
  },
  alternativeContent: {
    flex: 1,
    gap: spacing.xs,
  },
  alternativeText: {
    ...typography.body,
    color: palette.text,
  },
  feedback: {
    ...typography.caption,
    color: palette.success,
  },
  feedbackWrong: {
    color: palette.danger,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});

export default QuizPlayScreen;
