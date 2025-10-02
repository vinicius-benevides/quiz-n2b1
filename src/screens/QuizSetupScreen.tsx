import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { palette, radius, spacing, typography } from '../theme';
import { listThemes, pickRandomQuestions } from '../database';
import { Theme } from '../types';
import { RootStackParamList } from '../navigation/types';

const QuizSetupScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [questionAmount, setQuestionAmount] = useState(5);
  const [loading, setLoading] = useState(false);

  const loadThemes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listThemes();
      setThemes(data);
      if (data.length > 0) {
        setSelectedThemeId((prev) => prev ?? data[0].id);
      } else {
        setSelectedThemeId(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadThemes();
    }, [loadThemes])
  );

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedThemeId) ?? null,
    [themes, selectedThemeId]
  );

  useEffect(() => {
    if (!selectedTheme) {
      return;
    }
    const available = selectedTheme.questionCount ?? 0;
    if (available === 0) {
      setQuestionAmount(1);
    } else if (questionAmount > available) {
      setQuestionAmount(available);
    }
  }, [selectedTheme, questionAmount]);

  const availableQuestions = selectedTheme?.questionCount ?? 0;
  const maxQuestions = selectedTheme ? Math.max(availableQuestions, 0) : 0;
  const validAmount = Math.min(questionAmount, maxQuestions || questionAmount);

  const canDecrease = validAmount > 1;
  const canIncrease = selectedTheme ? validAmount < availableQuestions : false;

  const handleIncrease = () => {
    if (!canIncrease || !selectedTheme) {
      return;
    }
    setQuestionAmount((value) => Math.min(value + 1, availableQuestions));
  };

  const handleDecrease = () => {
    if (!canDecrease) {
      return;
    }
    setQuestionAmount((value) => Math.max(1, value - 1));
  };

  const handleBack = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handlePlay = async () => {
    if (!selectedTheme) {
      Alert.alert('Selecione um tema', 'Escolha um tema para iniciar o quiz.');
      return;
    }

    if ((selectedTheme.questionCount ?? 0) < questionAmount) {
      Alert.alert('Quantidade insuficiente', 'O tema escolhido nao possui perguntas suficientes.');
      return;
    }

    setLoading(true);
    try {
      const questions = await pickRandomQuestions(selectedTheme.id, questionAmount);
      if (questions.length < questionAmount) {
        Alert.alert('Perguntas insuficientes', 'Nao foi possivel carregar a quantidade solicitada de perguntas.');
        return;
      }

      navigation.navigate('QuizPlay', {
        theme: selectedTheme,
        questions,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <Header title="Preparar quiz" subtitle="Escolha o tema e a quantidade de perguntas" onBackPress={handleBack} />

      {loading && themes.length === 0 ? (
        <Card>
          <ActivityIndicator color={palette.secondary} />
        </Card>
      ) : themes.length === 0 ? (
        <EmptyState
          title="Nenhum tema disponivel"
          description="Cadastre temas e perguntas antes de iniciar o quiz."
        />
      ) : (
        <View style={styles.themeList}>
          {themes.map((item) => {
            const isSelected = item.id === selectedThemeId;
            return (
              <TouchableOpacity key={item.id} onPress={() => setSelectedThemeId(item.id)}>
                <Card style={[styles.themeCard, isSelected ? styles.themeCardActive : null]}>
                  <View style={styles.themeRow}>
                    <Text style={styles.themeName}>{item.name}</Text>
                    <Text style={styles.themeCount}>{item.questionCount ?? 0} perguntas</Text>
                  </View>
                  {item.description ? <Text style={styles.themeDescription}>{item.description}</Text> : null}
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedTheme ? (
        <Card>
          <Text style={styles.sectionTitle}>Quantidade de perguntas</Text>
          <Text style={styles.sectionSubtitle}>
            {availableQuestions > 0
              ? `${availableQuestions} ${availableQuestions == 1 ? 'pergunta cadastrada' : 'perguntas cadastradas'} neste tema.`
              : 'Nenhuma pergunta cadastrada neste tema.'}
          </Text>

          {availableQuestions > 0 ? (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepButton, !canDecrease && styles.stepButtonDisabled]}
                onPress={handleDecrease}
                disabled={!canDecrease}
              >
                <Text style={[styles.stepButtonLabel, !canDecrease && styles.stepButtonLabelDisabled]}>-</Text>
              </TouchableOpacity>
              <View style={styles.stepValueWrapper}>
                <Text style={styles.stepValue}>{validAmount}</Text>
                <Text style={styles.stepLabel}>{validAmount == 1 ? 'pergunta' : 'perguntas'}</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepButton, !canIncrease && styles.stepButtonDisabled]}
                onPress={handleIncrease}
                disabled={!canIncrease}
              >
                <Text style={[styles.stepButtonLabel, !canIncrease && styles.stepButtonLabelDisabled]}>+</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Button
            title={loading ? 'Carregando...' : 'Iniciar quiz'}
            onPress={handlePlay}
            disabled={loading || !selectedTheme || maxQuestions === 0}
          />
        </Card>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  themeList: {
    gap: spacing.lg,
  },
  themeCard: {
    gap: spacing.sm,
  },
  themeCardActive: {
    borderWidth: 1,
    borderColor: palette.secondary,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    ...typography.subtitle,
  },
  themeCount: {
    ...typography.caption,
  },
  themeDescription: {
    ...typography.caption,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  stepButton: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
  stepButtonLabel: {
    fontSize: 24,
    color: palette.text,
  },
  stepButtonLabelDisabled: {
    color: palette.textMuted,
  },
  stepValueWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepValue: {
    ...typography.title,
    color: palette.secondary,
  },
  stepLabel: {
    ...typography.caption,
  },
});

export default QuizSetupScreen;
