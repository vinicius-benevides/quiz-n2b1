import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { palette, spacing } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  paddingTop?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle">;
  avoidKeyboard?: boolean;
  keyboardOffset?: number;
};

export function Screen({
  children,
  scrollable = true,
  paddingTop = spacing.lg,
  contentContainerStyle,
  scrollProps,
  avoidKeyboard = false,
  keyboardOffset = 0,
}: Props) {
  const containerStyle = [styles.scrollContent, { paddingTop }, contentContainerStyle];
  const mergedScrollProps = {
    keyboardShouldPersistTaps: "handled" as ScrollViewProps["keyboardShouldPersistTaps"],
    ...(scrollProps ?? {}),
  };

  const content = scrollable ? (
    <ScrollView
      {...mergedScrollProps}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={containerStyle}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>{children}</View>
  );

  const safeContent = <SafeAreaView style={styles.safe}>{content}</SafeAreaView>;
  const body = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardOffset}
    >
      {safeContent}
    </KeyboardAvoidingView>
  ) : (
    safeContent
  );

  return (
    <LinearGradient colors={[palette.background, "#0B0D13"]} style={styles.gradient}>
      {body}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
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
