import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { palette, radius, spacing, typography } from '../theme';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string | null;
};

export const TextField = React.forwardRef<TextInput, Props>(
  ({ label, hint, error, style, multiline, ...rest }, ref) => {
    return (
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={palette.textMuted}
          multiline={multiline}
          style={[
            styles.input,
            multiline ? styles.multiline : null,
            style,
            error ? styles.inputError : null,
          ]}
          {...rest}
        />
        {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.caption,
    color: palette.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    color: palette.text,
    borderWidth: 1,
    borderColor: 'transparent',
    fontSize: 16,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    marginTop: spacing.xs,
    color: palette.danger,
  },
  inputError: {
    borderColor: palette.danger,
  },
});

export default TextField;
