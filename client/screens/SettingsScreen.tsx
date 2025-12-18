import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { TextInput } from "@/components/TextInput";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

const avatarColors = [
  ["#2563EB", "#3B82F6"],
  ["#10B981", "#34D399"],
  ["#F59E0B", "#FBBF24"],
  ["#EF4444", "#F87171"],
  ["#8B5CF6", "#A78BFA"],
  ["#EC4899", "#F472B6"],
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user, token, refreshUser, logout } = useAuth();
  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarPreset || 1);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!token) return;

    setIsSaving(true);
    try {
      const response = await authenticatedRequest("/api/user/me", token, {
        method: "PATCH",
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          avatarPreset: selectedAvatar,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await refreshUser();
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Deletion",
              "This will permanently delete all your data including tasks, subscription, and account information.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: async () => {
                    if (!token) return;
                    try {
                      await authenticatedRequest("/api/user/me", token, {
                        method: "DELETE",
                      });
                      await logout();
                    } catch (error) {
                      Alert.alert("Error", "Failed to delete account");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
        
        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Display Name
          </ThemedText>
          <TextInput
            placeholder="Enter your name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Email
          </ThemedText>
          <View style={[styles.emailBox, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={{ color: theme.textSecondary }}>
              {user?.email}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Avatar</ThemedText>
        <View style={styles.avatarGrid}>
          {avatarColors.map((colors, index) => (
            <Pressable
              key={index}
              style={[
                styles.avatarOption,
                {
                  backgroundColor: colors[0],
                  borderWidth: selectedAvatar === index + 1 ? 3 : 0,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setSelectedAvatar(index + 1)}
            >
              {selectedAvatar === index + 1 && (
                <Feather name="check" size={24} color="#fff" />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <Button onPress={handleSave} disabled={isSaving} style={styles.saveButton}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>

      <View style={[styles.dangerZone, { borderColor: theme.danger }]}>
        <ThemedText style={[styles.dangerTitle, { color: theme.danger }]}>
          Danger Zone
        </ThemedText>
        <ThemedText style={[styles.dangerText, { color: theme.textSecondary }]}>
          Once you delete your account, there is no going back. Please be certain.
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            { backgroundColor: theme.danger, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleDeleteAccount}
        >
          <Feather name="trash-2" size={16} color="#fff" />
          <ThemedText style={styles.deleteButtonText}>Delete Account</ThemedText>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  emailBox: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    marginBottom: Spacing.xl,
  },
  dangerZone: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  dangerText: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 44,
    borderRadius: BorderRadius.sm,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
