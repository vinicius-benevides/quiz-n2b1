import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { gradients, radius, shadows, spacing } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  gradient?: 'surface' | 'primary';
};

export function Card({ children, style, gradient = 'surface' }: Props) {
  const colors = gradients[gradient];

  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.container, style]}>
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    ...shadows.card,
  },
  inner: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: 20,
    gap: spacing.sm,
  },
});
