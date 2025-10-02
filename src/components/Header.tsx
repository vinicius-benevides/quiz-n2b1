import React, { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { palette, radius, spacing, typography } from "../theme";
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBackPress?: () => void;
};

export function Header({ title, subtitle, right, onBackPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.leftArea}>
        {onBackPress ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <FontAwesome name="chevron-left" style={styles.backIcon} size={16} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  leftArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: palette.secondary,
  },
  right: {
    width: 130,
  },
});
