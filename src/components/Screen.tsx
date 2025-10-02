import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  paddingTop?: number;
};

export function Screen({ children, scrollable = true, paddingTop = spacing.lg }: Props) {
  const content = scrollable ? (
    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop }]}>{children}</ScrollView>
  ) : (
    <View style={[styles.scrollContent, { paddingTop }]}>{children}</View>
  );

  return (
    <LinearGradient colors={[palette.background, '#0B0D13']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {content}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
});
