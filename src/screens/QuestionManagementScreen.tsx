import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { palette, radius, spacing, typography } from '../theme';
import { deleteQuestion, listQuestionsByTheme, listThemes } from '../database';
import { QuestionWithAlternatives, Theme } from '../types';
import { RootStackParamList } from '../navigation/types';

const QuestionManagementScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionWithAlternatives[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const loadThemes = useCallback(async () => {
    setLoadingThemes(true);
    try {
      const data = await listThemes();
      setThemes(data);
      if (data.length === 0) {
        setSelectedThemeId(null);
        setQuestions([]);
        return;
      }
      setSelectedThemeId((prev) => {
        if (prev && data.some((theme) => theme.id === prev)) {
          return prev;
        }
        return data[0].id;
      });
    } finally {
      setLoadingThemes(false);
    }
  }, []);

  const loadQuestions = useCallback(async (themeId: number) => {
    setLoadingQuestions(true);
    try {
      const data = await listQuestionsByTheme(themeId);
      setQuestions(data);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadThemes();
    }, [loadThemes])
  );

  useFocusEffect(
    useCallback(() => {
      if (!selectedThemeId) {
        return;
      }
      let active = true;
      (async () => {
        const data = await listQuestionsByTheme(selectedThemeId);
        if (active) {
          setQuestions(data);
        }
      })();
      return () => {
        active = false;
      };
    }, [selectedThemeId])
  );

  const selectedTheme = useMemo(() => themes.find((theme) => theme.id === selectedThemeId) ?? null, [themes, selectedThemeId]);

  const handleSelectTheme = (themeId: number) => {
    setSelectedThemeId(themeId);
    loadQuestions(themeId);
  };

  const handleDeleteQuestion = (question: QuestionWithAlternatives) => {
    Alert.alert('Excluir pergunta', 'Deseja realmente excluir esta pergunta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteQuestion(question.id);
          if (selectedThemeId) {
            await loadQuestions(selectedThemeId);
          }
        },
      },
    ]);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <Header
        title="Perguntas"
        subtitle="Mantenha seu banco de perguntas sempre atualizado"
        onBackPress={() => navigation.goBack()}
        right={
          <Button
            title="Nova pergunta"
            disabled={!selectedTheme}
            onPress={() =>
              selectedTheme &&
              navigation.navigate('QuestionForm', {
                themeId: selectedTheme.id,
              })
            }
          />
        }
      />

      <Card>
        <Text style={styles.sectionTitle}>Temas disponiveis</Text>
        {loadingThemes ? (
          <ActivityIndicator color={palette.secondary} style={styles.themeLoading} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeChips}>
            {themes.map((theme) => {
              const isActive = theme.id === selectedThemeId;
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[styles.themeChip, isActive ? styles.themeChipActive : null]}
                  onPress={() => handleSelectTheme(theme.id)}
                >
                  <View style={[styles.themeBullet, { backgroundColor: theme.color }]} />
                  <Text style={styles.themeChipLabel}>{theme.name}</Text>
                  <Text style={styles.themeCountLabel}>{theme.questionCount ?? 0} questoes</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </Card>

      {selectedTheme ? (
        <Card style={styles.questionWrapper}>
          <View style={styles.questionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Perguntas do tema</Text>
              <Text style={styles.sectionSubtitle}>{selectedTheme.name}</Text>
            </View>
            <ProgressBar progress={questions.length ? Math.min(1, (questions.length ?? 0) / 10) : 0} />
          </View>

          {loadingQuestions ? (
            <ActivityIndicator color={palette.secondary} style={styles.questionLoading} />
          ) : questions.length === 0 ? (
            <EmptyState
              title="Ainda nao ha perguntas"
              description="Crie perguntas para que este tema possa ser utilizado no quiz."
            />
          ) : (
            <View style={styles.questionsList}>
              {questions.map((question) => (
                <TouchableOpacity
                  key={question.id}
                  onPress={() =>
                    navigation.navigate('QuestionForm', {
                      themeId: selectedTheme.id,
                      questionId: question.id,
                    })
                  }
                  onLongPress={() => handleDeleteQuestion(question)}
                  style={styles.questionCard}
                >
                  <Text style={styles.questionStatement}>{question.statement}</Text>
                  <View style={styles.alternativeRow}>
                    {question.alternatives.map((alternative) => (
                      <Text
                        key={alternative.id}
                        style={[styles.alternativeTag, alternative.isCorrect ? styles.alternativeCorrect : null]}
                      >
                        {alternative.text}
                      </Text>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>
      ) : (
        <EmptyState
          title="Selecione um tema"
          description="Cadastre um tema ou selecione um existente para visualizar e criar perguntas."
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: palette.text,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: palette.textMuted,
  },
  themeLoading: {
    marginTop: spacing.md,
  },
  themeChips: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  themeChip: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 180,
    gap: spacing.xs,
  },
  themeChipActive: {
    borderWidth: 1,
    borderColor: palette.secondary,
  },
  themeBullet: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
  },
  themeChipLabel: {
    ...typography.body,
    color: palette.text,
  },
  themeCountLabel: {
    ...typography.caption,
  },
  questionWrapper: {
    gap: spacing.lg,
  },
  questionHeader: {
    gap: spacing.sm,
  },
  questionLoading: {
    marginTop: spacing.lg,
  },
  questionsList: {
    gap: spacing.md,
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  questionStatement: {
    ...typography.body,
    color: palette.text,
    fontWeight: '600',
  },
  alternativeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  alternativeTag: {
    ...typography.caption,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  alternativeCorrect: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    color: palette.success,
  },
});

export default QuestionManagementScreen;



