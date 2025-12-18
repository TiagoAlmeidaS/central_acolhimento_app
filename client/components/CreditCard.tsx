import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export function CreditCard() {
  const { subscription } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const credits = subscription?.credits || 0;
  const monthlyCredits = subscription?.monthlyCredits || 10;
  const percentage = Math.min((credits / monthlyCredits) * 100, 100);
  const isLow = credits <= 3;

  const handlePress = () => {
    navigation.navigate("Subscription");
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.9 : 1 }]}
      onPress={handlePress}
    >
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Feather name="zap" size={20} color="#fff" />
            <ThemedText style={styles.title}>AI Credits</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
        </View>

        <View style={styles.creditInfo}>
          <ThemedText style={styles.creditValue}>{credits}</ThemedText>
          <ThemedText style={styles.creditLabel}>
            of {monthlyCredits} credits remaining
          </ThemedText>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%`, backgroundColor: isLow ? Colors.light.warning : "#fff" },
              ]}
            />
          </View>
        </View>

        {isLow && (
          <View style={styles.warningRow}>
            <Feather name="alert-circle" size={14} color={Colors.light.warning} />
            <ThemedText style={styles.warningText}>
              Running low! Upgrade for more credits
            </ThemedText>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  gradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  creditInfo: {
    marginBottom: Spacing.md,
  },
  creditValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
  creditLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  warningText: {
    fontSize: 12,
    color: Colors.light.warning,
  },
});
