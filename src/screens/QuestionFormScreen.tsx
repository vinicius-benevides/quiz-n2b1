import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import TextField from '../components/TextField';
import { Screen } from '../components/Screen';
import { palette, radius, spacing, typography } from '../theme';
import { createQuestion, getQuestionWithAlternatives, getTheme, updateQuestion } from '../database';
import { NewQuestion, Theme } from '../types';
import { RootStackParamList } from '../navigation/types';

const emptyAlternative = () => ({ text: '', isCorrect: false });

const QuestionFormScreen = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'QuestionForm'>) => {
  const { themeId, questionId } = route.params;
  const [theme, setTheme] = useState<Theme | null>(null);
  const [statement, setStatement] = useState('');
  const [explanation, setExplanation] = useState('');
  const [alternatives, setAlternatives] = useState([
    emptyAlternative(),
    emptyAlternative(),
    emptyAlternative(),
    emptyAlternative(),
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const themeData = await getTheme(themeId);
      setTheme(themeData);
    })();
  }, [themeId]);

  useEffect(() => {
    if (!questionId) {
      return;
    }
    (async () => {
      const question = await getQuestionWithAlternatives(questionId);
      if (!question) {
        return;
      }
      setStatement(question.statement);
      setExplanation(question.explanation ?? '');
      setAlternatives(
        question.alternatives.map((alternative) => ({
          text: alternative.text,
          isCorrect: alternative.isCorrect,
        }))
      );
    })();
  }, [questionId]);

  const handleSelectCorrect = (index: number) => {
    setAlternatives((prev) =>
      prev.map((item, itemIndex) => ({
        ...item,
        isCorrect: itemIndex === index,
      }))
    );
  };

  const handleChangeAlternative = (index: number, value: string) => {
    setAlternatives((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, text: value } : item))
    );
  };

  const validate = () => {
    if (!statement.trim()) {
      setError('Descreva o enunciado da pergunta.');
      return false;
    }
    const normalized = alternatives.map((alternative) => ({
      text: alternative.text.trim(),
      isCorrect: alternative.isCorrect,
    }));

    if (normalized.some((alternative) => !alternative.text)) {
      setError('Preencha todas as alternativas.');
      return false;
    }

    if (normalized.filter((alternative) => alternative.isCorrect).length !== 1) {
      setError('Selecione exatamente uma alternativa correta.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const payload: NewQuestion = {
      themeId,
      statement: statement.trim(),
      explanation: explanation.trim() || undefined,
      alternatives: alternatives.map((alternative) => ({
        text: alternative.text.trim(),
        isCorrect: alternative.isCorrect,
      })),
    };

    setSaving(true);
    try {
      if (questionId) {
        await updateQuestion(questionId, {
          statement: payload.statement,
          explanation: payload.explanation ?? null,
          alternatives: payload.alternatives,
        });
      } else {
        await createQuestion(payload);
      }

      Alert.alert('Tudo certo!', 'Pergunta salva com sucesso.', [
        {
          text: 'Voltar',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert('Erro', 'Nao foi possivel salvar a pergunta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <Header title={questionId ? 'Editar pergunta' : 'Nova pergunta'} subtitle={theme ? theme.name : 'Carregando tema...'} />

      <Card>
        <TextField
          label="Enunciado"
          value={statement}
          onChangeText={(value) => {
            setStatement(value);
            if (error) {
              setError(null);
            }
          }}
          placeholder="Informe o enunciado da pergunta"
          multiline
          error={error}
        />
        <TextField
          label="Explicacao (opcional)"
          value={explanation}
          onChangeText={setExplanation}
          placeholder="Use este campo para registrar um comentario ou explicacao"
          multiline
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Alternativas</Text>
        <Text style={styles.sectionSubtitle}>
          Toque no marcador ao lado para definir a alternativa correta. Cada pergunta precisa de quatro alternativas.
        </Text>

        {alternatives.map((alternative, index) => (
          <View key={index} style={styles.alternativeRow}>
            <TouchableOpacity
              style={[styles.radio, alternative.isCorrect ? styles.radioActive : null]}
              onPress={() => handleSelectCorrect(index)}
            />
            <TextField
              value={alternative.text}
              onChangeText={(value) => handleChangeAlternative(index, value)}
              placeholder={`Alternativa ${index + 1}`}
              style={styles.alternativeInput}
            />
          </View>
        ))}
      </Card>

      <View style={styles.footer}>
        <Button title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} />
        <Button title={saving ? 'Salvando...' : 'Salvar pergunta'} onPress={handleSubmit} disabled={saving} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.xs,
    color: palette.text,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  alternativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.border,
  },
  radioActive: {
    borderColor: palette.secondary,
    backgroundColor: 'rgba(0, 208, 255, 0.2)',
  },
  alternativeInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.md,
    marginTop: 'auto',
  },
});

export default QuestionFormScreen;




