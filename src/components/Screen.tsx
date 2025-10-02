import React, { ReactNode } from "react";
import { ScrollView, ScrollViewProps, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { palette, spacing } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  paddingTop?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle">;
};

export function Screen({
  children,
  scrollable = true,
  paddingTop = spacing.lg,
  contentContainerStyle,
  scrollProps,
}: Props) {
  const containerStyle = [styles.scrollContent, { paddingTop }, contentContainerStyle];

  const content = scrollable ? (
    <ScrollView
      {...scrollProps}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={containerStyle}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>{children}</View>
  );

  return (
    <LinearGradient colors={[palette.background, "#0B0D13"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>{content}</SafeAreaView>
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
    flexGrow: 1,
  },
});
