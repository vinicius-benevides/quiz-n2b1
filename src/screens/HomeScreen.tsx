import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { palette, spacing, typography } from '../theme';
import { listThemes } from '../database';
import { Theme } from '../types';
import { RootStackParamList } from '../navigation/types';

const actionButtons = [
  { label: 'Temas', route: 'Themes' as const, description: 'Cadastre e personalize temas para organizar suas perguntas.' },
  { label: 'Perguntas', route: 'QuestionManagement' as const, description: 'Crie perguntas com alternativas e vincule a um tema.' },
  { label: 'Jogar quiz', route: 'QuizSetup' as const, description: 'Escolha um tema, defina a quantidade de perguntas e divirta-se.' },
];

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshThemes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listThemes();
      setThemes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        setLoading(true);
        try {
          const data = await listThemes();
          if (isActive) {
            setThemes(data);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const totalQuestions = themes.reduce((acc, theme) => acc + (theme.questionCount ?? 0), 0);

  return (
    <Screen>
      <Header title="Quiz N2B1" subtitle="Construa seu próprio Quiz" />

      <Card>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.secondary} />
          </View>
        ) : (
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{themes.length}</Text>
              <Text style={styles.metricLabel}>temas</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{totalQuestions}</Text>
              <Text style={styles.metricLabel}>perguntas</Text>
            </View>
          </View>
        )}
      </Card>

      <View style={styles.actions}>
        {actionButtons.map((action) => (
          <Card key={action.route} style={styles.actionCard}>
            <Text style={styles.actionTitle}>{action.label}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
            <Button title="Acessar" onPress={() => navigation.navigate(action.route)} />
          </Card>
        ))}
      </View>

      <Card>
        <Text style={styles.hintTitle}>Dica</Text>
        <Text style={styles.hintText}>
          Cadastre pelo menos quatro perguntas por tema para obter uma experiencia mais variada no quiz.
        </Text>
        <Button title="Atualizar estatisticas" variant="ghost" onPress={refreshThemes} style={styles.refreshButton} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  metricValue: {
    ...typography.title,
    color: palette.secondary,
  },
  metricLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  actions: {
    gap: spacing.lg,
  },
  actionCard: {
    gap: spacing.md,
  },
  actionTitle: {
    ...typography.subtitle,
    fontSize: 20,
    color: palette.text,
  },
  actionDescription: {
    ...typography.body,
    color: palette.textMuted,
  },
  hintTitle: {
    ...typography.subtitle,
    color: palette.accent,
  },
  hintText: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  refreshButton: {
    marginTop: spacing.md,
  },
});

export default HomeScreen;
