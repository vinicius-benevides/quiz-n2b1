import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function Header({ title, subtitle, right }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  texts: {
    flex: 1,
  },
  title: {
    ...typography.title,
    color: palette.text,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
