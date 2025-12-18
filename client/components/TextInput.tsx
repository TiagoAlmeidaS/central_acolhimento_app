import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  View,
} from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TextInputProps extends RNTextInputProps {
  error?: boolean;
}

export function TextInput({ error, style, ...props }: TextInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: error
            ? theme.danger
            : isFocused
            ? theme.primary
            : theme.border,
        },
      ]}
    >
      <RNTextInput
        style={[
          styles.input,
          { color: theme.text },
          style,
        ]}
        placeholderTextColor={theme.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    flex: 1,
  },
});
