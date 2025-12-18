import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function VoiceInputScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={() => navigation.goBack()}>
          <ThemedText style={{ color: theme.link }}>Cancel</ThemedText>
        </HeaderButton>
      ),
    });
  }, [navigation, theme]);

  const handleRecordPress = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      if (Platform.OS === "web") {
        Alert.alert(
          "Voice Input",
          "Voice recording works best in Expo Go on your mobile device. Please use text input instead on web.",
          [
            { text: "Use Text Input", onPress: () => navigation.navigate("TextInput" as never) },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }
      setIsRecording(true);
    }
  };

  const handleTextInput = () => {
    navigation.navigate("TextInput" as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.content}>
        <View style={styles.waveformContainer}>
          {isRecording ? (
            <View style={styles.waveform}>
              {[...Array(5)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { backgroundColor: theme.primary, height: 20 + Math.random() * 40 },
                  ]}
                />
              ))}
            </View>
          ) : (
            <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
              Tap to start recording
            </ThemedText>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.recordButton,
            {
              backgroundColor: isRecording ? theme.danger : theme.primary,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          onPress={handleRecordPress}
        >
          <Feather
            name={isRecording ? "square" : "mic"}
            size={32}
            color={Colors.light.buttonText}
          />
        </Pressable>

        <ThemedText style={[styles.status, { color: theme.textSecondary }]}>
          {isRecording ? "Recording..." : "Ready to listen"}
        </ThemedText>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable onPress={handleTextInput} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <ThemedText style={[styles.linkText, { color: theme.link }]}>
            Type Instead
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  waveformContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  waveBar: {
    width: 8,
    borderRadius: 4,
  },
  hint: {
    fontSize: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  status: {
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
