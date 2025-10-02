import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { palette, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

const CIRCLE_SIZE = 140;
const STROKE_WIDTH = 10;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const QuizSummaryScreen = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'QuizSummary'>) => {
  const { results, theme } = route.params;

  const { correct, percentage } = useMemo(() => {
    const total = results.length;
    const correctAnswers = results.filter((item) => item.isCorrect).length;
    const pct = total === 0 ? 0 : Math.round((correctAnswers / total) * 100);
    return { correct: correctAnswers, percentage: pct };
  }, [results]);

  const progress = Math.min(Math.max(percentage / 100, 0), 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <Screen>
      <Header title="Resumo do quiz" subtitle={theme.name} />

      <Card>
        <View style={styles.scoreWrapper}>
          <View style={styles.scoreCircle}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={palette.secondary}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                fill="none"
                transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
              />
            </Svg>
            <View style={styles.scoreValueWrapper} pointerEvents="none">
              <Text style={styles.scoreValue}>{percentage}%</Text>
            </View>
          </View>
          <View style={styles.scoreText}>
            <Text style={styles.scoreHighlight}>{correct} acertos</Text>
            <Text style={styles.scoreLegend}>de {results.length} perguntas respondidas</Text>
          </View>
        </View>
      </Card>

      <View style={styles.resultsList}>
        {results.map((result, index) => {
          const correctAlternative = result.question.alternatives.find((alt) => alt.isCorrect);
          const selectedAlternative = result.question.alternatives.find((alt) => alt.id === result.selectedAlternativeId);
          const isCorrect = result.isCorrect;

          return (
            <Card key={result.question.id} style={[styles.resultCard, isCorrect ? styles.resultCorrect : styles.resultWrong]}>
              <Text style={styles.resultTitle}>Pergunta {index + 1}</Text>
              <Text style={styles.resultStatement}>{result.question.statement}</Text>
              <Text style={styles.resultTag}>{isCorrect ? 'Acertou' : 'Errou'}</Text>
              {!isCorrect && correctAlternative ? (
                <Text style={styles.resultDetail}>Correta: {correctAlternative.text}</Text>
              ) : null}
              {!isCorrect && selectedAlternative ? (
                <Text style={styles.resultDetailWrong}>Voce marcou: {selectedAlternative.text}</Text>
              ) : null}
            </Card>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button title="Jogar novamente" onPress={() => navigation.replace('QuizSetup')} />
        <Button title="Voltar para inicio" variant="ghost" onPress={() => navigation.navigate('Home')} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scoreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scoreCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValueWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    ...typography.title,
    color: palette.secondary,
  },
  scoreText: {
    flex: 1,
    gap: spacing.sm,
  },
  scoreHighlight: {
    ...typography.subtitle,
    color: palette.text,
  },
  scoreLegend: {
    ...typography.caption,
  },
  resultsList: {
    gap: spacing.md,
  },
  resultCard: {
    gap: spacing.xs,
  },
  resultCorrect: {
    borderWidth: 1,
    borderColor: palette.success,
  },
  resultWrong: {
    borderWidth: 1,
    borderColor: palette.danger,
  },
  resultTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultStatement: {
    ...typography.body,
    color: palette.text,
  },
  resultTag: {
    ...typography.subtitle,
    color: palette.text,
  },
  resultDetail: {
    ...typography.caption,
    color: palette.success,
  },
  resultDetailWrong: {
    ...typography.caption,
    color: palette.danger,
  },
  footer: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
});

export default QuizSummaryScreen;
