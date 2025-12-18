import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TextInput as RNTextInput, Alert, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { HeaderButton } from "@react-navigation/elements";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function TextInputScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const { token, updateCredits } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<RNTextInput>(null);

  const [input, setInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const createTaskMutation = useMutation({
    mutationFn: async (taskInput: string) => {
      if (!token) throw new Error("Not authenticated");
      const response = await authenticatedRequest("/api/tasks", token, {
        method: "POST",
        body: JSON.stringify({ input: taskInput, type: "text" }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create task");
      }
      return response.json();
    },
    onSuccess: (data) => {
      updateCredits(data.credits);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={() => navigation.goBack()}>
          <ThemedText style={{ color: theme.link }}>Cancel</ThemedText>
        </HeaderButton>
      ),
      headerRight: () => (
        <HeaderButton
          onPress={() => {
            if (input.trim()) {
              createTaskMutation.mutate(input.trim());
            }
          }}
          disabled={!input.trim() || createTaskMutation.isPending}
        >
          {createTaskMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.link} />
          ) : (
            <ThemedText
              style={{
                color: input.trim() ? theme.link : theme.textSecondary,
                fontWeight: "600",
              }}
            >
              Submit
            </ThemedText>
          )}
        </HeaderButton>
      ),
    });
  }, [navigation, theme, input, createTaskMutation.isPending]);

  const characterCount = input.length;
  const maxCharacters = 500;

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.inputSection}>
        <View
          style={[
            styles.inputContainer,
            { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <RNTextInput
            ref={inputRef}
            style={[
              styles.textInput, 
              { color: theme.text },
              Platform.OS === 'web' && { outlineStyle: 'none' } as any,
            ]}
            placeholder="What do you need to do?"
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={(text) => setInput(text.slice(0, maxCharacters))}
            multiline
            textAlignVertical="top"
            maxLength={maxCharacters}
            accessibilityLabel="Task description"
            accessibilityHint="Enter a description of your task"
          />
        </View>
        
        <View style={styles.inputFooter}>
          <ThemedText style={[styles.charCount, { color: theme.textSecondary }]}>
            {characterCount}/{maxCharacters}
          </ThemedText>
        </View>
      </View>

      <View style={styles.aiSection}>
        <View style={[styles.aiHeader, { backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)' }]}>
          <View style={styles.aiIconContainer}>
            <Feather name="cpu" size={18} color={theme.primary} />
          </View>
          <View style={styles.aiTextContainer}>
            <ThemedText style={[styles.aiTitle, { color: theme.text }]}>
              AI-Powered Organization
            </ThemedText>
            <ThemedText style={[styles.aiSubtitle, { color: theme.textSecondary }]}>
              Our AI will extract title, category, priority, and smart suggestions
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.tipsSection}>
        <ThemedText style={[styles.tipsTitle, { color: theme.text }]}>
          Tips for better results
        </ThemedText>
        
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={[styles.tipIcon, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }]}>
              <Feather name="calendar" size={14} color="#10B981" />
            </View>
            <View style={styles.tipContent}>
              <ThemedText style={[styles.tipLabel, { color: theme.text }]}>Add deadlines</ThemedText>
              <ThemedText style={[styles.tipExample, { color: theme.textSecondary }]}>
                "Submit report by Friday"
              </ThemedText>
            </View>
          </View>

          <View style={styles.tipItem}>
            <View style={[styles.tipIcon, { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }]}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
            </View>
            <View style={styles.tipContent}>
              <ThemedText style={[styles.tipLabel, { color: theme.text }]}>Mention priority</ThemedText>
              <ThemedText style={[styles.tipExample, { color: theme.textSecondary }]}>
                "Urgent: call the client"
              </ThemedText>
            </View>
          </View>

          <View style={styles.tipItem}>
            <View style={[styles.tipIcon, { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' }]}>
              <Feather name="info" size={14} color="#3B82F6" />
            </View>
            <View style={styles.tipContent}>
              <ThemedText style={[styles.tipLabel, { color: theme.text }]}>Include context</ThemedText>
              <ThemedText style={[styles.tipExample, { color: theme.textSecondary }]}>
                "Buy groceries for Saturday's party"
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.creditBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <Feather name="zap" size={14} color={theme.primary} />
        <ThemedText style={[styles.creditText, { color: theme.textSecondary }]}>
          1 AI credit per task
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  inputSection: {
    gap: Spacing.xs,
  },
  inputContainer: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  charCount: {
    fontSize: 12,
  },
  aiSection: {
    marginTop: Spacing.xs,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  aiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTextContainer: {
    flex: 1,
    gap: 2,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiSubtitle: {
    fontSize: 12,
  },
  tipsSection: {
    gap: Spacing.md,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
    gap: 2,
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tipExample: {
    fontSize: 12,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  creditText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
