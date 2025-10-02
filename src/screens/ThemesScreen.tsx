import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import TextField from '../components/TextField';
import { palette, radius, spacing, typography } from '../theme';
import { createTheme, deleteTheme, listThemes, ThemeNameConflictError, updateTheme } from '../database';
import { Theme } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const presetColors = ['#7C4DFF', '#00D0FF', '#FFB92E', '#FF5252', '#4CAF50', '#FF6F91'];

const ThemesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(presetColors[0]);
  const [error, setError] = useState<string | null>(null);

  const loadThemes = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const { silent = false } = options;
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await listThemes();
        setThemes(data);
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadThemes();
    }, [loadThemes])
  );

  const resetForm = useCallback(() => {
    setEditingTheme(null);
    setName('');
    setDescription('');
    setColor(presetColors[Math.floor(Math.random() * presetColors.length)]);
    setError(null);
  }, []);

  const openModal = useCallback(
    (theme?: Theme) => {
      if (theme) {
        setEditingTheme(theme);
        setName(theme.name);
        setDescription(theme.description ?? '');
        setColor(theme.color);
      } else {
        resetForm();
      }
      setModalVisible(true);
    },
    [resetForm]
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    resetForm();
  }, [resetForm]);

  const handleSave = async () => {
    // eslint-disable-next-line no-console
    console.log('[ThemesScreen] Saving theme', { editingTheme, name, description, color });

    if (!name.trim()) {
      setError('Informe um nome para o tema.');
      return;
    }

    try {
      if (editingTheme) {
        await updateTheme(editingTheme.id, {
          name: name.trim(),
          description: description.trim() || null,
          color,
        });
      } else {
        await createTheme({
          name: name.trim(),
          description: description.trim() || null,
          color,
        });
      }

      closeModal();
      await loadThemes({ silent: true });
    } catch (err) {
      if (err instanceof ThemeNameConflictError) {
        setError('Ja existe um tema com esse nome. Escolha outro.');
        return;
      }

      console.error('[ThemesScreen] Failed to save theme', err);
      setError('Nao foi possivel salvar o tema. Verifique se o nome ja esta em uso.');
    }
  };

  const handleDelete = (theme: Theme) => {
    Alert.alert(
      'Excluir tema',
      'Tem certeza que deseja excluir este tema e todas as suas perguntas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            console.log('[ThemesScreen] Deleting theme', theme.id);
            await deleteTheme(theme.id);
            await loadThemes({ silent: true });
          },
        },
      ]
    );
  };

  const sortedThemes = useMemo(
    () => [...themes].sort((a, b) => a.name.localeCompare(b.name)),
    [themes]
  );

  return (
    <Screen
      contentContainerStyle={styles.container}
      scrollProps={{
        refreshControl: (
          <RefreshControl
            colors={[palette.secondary]}
            tintColor={palette.secondary}
            refreshing={refreshing}
            onRefresh={() => loadThemes({ silent: true })}
          />
        ),
      }}
    >
      <Header title="Temas" subtitle="Organize os temas" onBackPress={() => navigation.goBack()} right={<Button title="Novo tema" onPress={() => openModal()} />} />

      {loading && themes.length === 0 ? (
        <Card>
          <Text style={styles.loadingText}>Carregando temas...</Text>
        </Card>
      ) : sortedThemes.length === 0 ? (
        <EmptyState
          title="Nenhum tema cadastrado"
          description="Crie um tema para comecar a montar suas perguntas."
        />
      ) : (
        <View style={styles.themeList}>
          {sortedThemes.map((item) => (
            <Card key={item.id} style={styles.themeCard}>
              <View style={styles.themeHeader}>
                <View style={[styles.colorBadge, { backgroundColor: item.color }]} />
                <View style={styles.themeInfo}>
                  <Text style={styles.themeName}>{item.name}</Text>
                  {item.description ? <Text style={styles.themeDescription}>{item.description}</Text> : null}
                </View>
              </View>
              <View style={styles.themeFooter}>
                <Text style={styles.themeCount}>
                  {item.questionCount ?? 0} {item.questionCount === 1 ? 'pergunta' : 'perguntas'}
                </Text>
                <View style={styles.themeActions}>
                  <TouchableOpacity onPress={() => openModal(item)}>
                    <Text style={styles.edit}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Text style={styles.delete}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTheme ? 'Editar tema' : 'Novo tema'}</Text>
            <TextField
              label="Nome"
              value={name}
              onChangeText={(value) => {
                setName(value);
                setError(null);
              }}
              placeholder="Ex: Logica de programacao"
              error={error}
            />
            <TextField
              label="Descricao"
              value={description}
              onChangeText={setDescription}
              placeholder="Uma breve descricao"
            />
            <View style={styles.colorsContainer}>
              <Text style={styles.colorsLabel}>Cor</Text>
              <View style={styles.colorsRow}>
                {presetColors.map((itemColor) => (
                  <TouchableOpacity
                    key={itemColor}
                    style={[
                      styles.colorOption,
                      { backgroundColor: itemColor },
                      color === itemColor ? styles.colorOptionSelected : null,
                    ]}
                    onPress={() => setColor(itemColor)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.modalActions}>
              <Button title="Cancelar" variant="ghost" onPress={closeModal} />
              <Button title={editingTheme ? 'Salvar' : 'Cadastrar'} onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.caption,
    textAlign: 'center',
  },
  themeList: {
    gap: spacing.lg,
  },
  themeCard: {
    gap: spacing.md,
  },
  themeHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  colorBadge: {
    width: 16,
    height: 80,
    borderRadius: radius.md,
  },
  themeInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  themeName: {
    ...typography.subtitle,
    color: palette.text,
  },
  themeDescription: {
    ...typography.caption,
  },
  themeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeCount: {
    ...typography.caption,
  },
  themeActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  edit: {
    color: palette.secondary,
    fontWeight: '600',
  },
  delete: {
    color: palette.danger,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.subtitle,
    fontSize: 20,
    textAlign: 'center',
    color: palette.text,
  },
  colorsContainer: {
    gap: spacing.sm,
  },
  colorsLabel: {
    ...typography.caption,
    color: palette.text,
  },
  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: palette.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});

export default ThemesScreen;









