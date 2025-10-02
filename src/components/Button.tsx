import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { palette, radius, spacing, typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonColors = {
  background: string;
  text: string;
  borderWidth?: number;
  borderColor?: string;
};

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ title, onPress, disabled = false, variant = 'primary', style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const colors: ButtonColors = useMemo(() => {
    switch (variant) {
      case 'secondary':
        return {
          background: palette.surfaceAlt,
          text: palette.text,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: palette.text,
          borderWidth: 1,
          borderColor: palette.border,
        };
      default:
        return {
          background: palette.primary,
          text: '#fff',
        };
    }
  }, [variant]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        { backgroundColor: colors.background },
        colors.borderWidth ? { borderWidth: colors.borderWidth, borderColor: colors.borderColor } : null,
        style,
        { transform: [{ scale }] },
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    ...typography.subtitle,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
