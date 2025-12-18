import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { HeaderButton } from "@react-navigation/elements";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  taskCreated?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your TaskNote AI assistant. Tell me what you need to do, and I'll help you create and organize your tasks. You can describe your task naturally - I'll extract the details for you!",
  timestamp: new Date(),
};

const SUGGESTIONS = [
  "I need to submit the report by Friday",
  "Remind me to call mom tomorrow",
  "Urgent: prepare presentation for meeting",
];

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const { token, updateCredits } = useAuth();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={theme.text} />
        </HeaderButton>
      ),
    });
  }, [navigation, theme]);

  const createTaskMutation = useMutation({
    mutationFn: async (taskInput: string) => {
      if (!token) throw new Error("Not authenticated");
      const response = await authenticatedRequest("/api/tasks", token, {
        method: "POST",
        body: JSON.stringify({ input: taskInput, type: "chat" }),
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
      
      const successMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `I've created your task:\n\n**${data.task.title}**\n\nCategory: ${data.task.category}\nPriority: ${data.task.priority}\n\n${data.task.aiNotes ? `Suggestion: ${data.task.aiNotes}` : ""}\n\nWould you like to add another task?`,
        timestamp: new Date(),
        taskCreated: true,
      };
      
      setMessages((prev) => [...prev, successMessage]);
    },
    onError: (error: Error) => {
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I couldn't create that task: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || createTaskMutation.isPending) return;

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      role: "assistant",
      content: "...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("thinking-")));
      createTaskMutation.mutate(text);
    }, 500);
  }, [input, createTaskMutation]);

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    const isThinking = item.content === "...";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Feather name="cpu" size={16} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: theme.primary }]
              : [styles.assistantBubble, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }],
          ]}
        >
          {isThinking ? (
            <View style={styles.thinkingContainer}>
              <ActivityIndicator size="small" color={theme.textSecondary} />
            </View>
          ) : (
            <ThemedText
              style={[
                styles.messageText,
                isUser ? styles.userText : { color: theme.text },
              ]}
            >
              {item.content}
            </ThemedText>
          )}
        </View>
      </View>
    );
  };

  const showSuggestions = messages.length === 1;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: Spacing.lg },
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          showSuggestions ? (
            <View style={styles.suggestionsContainer}>
              <ThemedText style={[styles.suggestionsTitle, { color: theme.textSecondary }]}>
                Quick suggestions:
              </ThemedText>
              <View style={styles.suggestionsList}>
                {SUGGESTIONS.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      { 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    onPress={() => handleSuggestion(suggestion)}
                  >
                    <ThemedText style={[styles.suggestionText, { color: theme.text }]}>
                      {suggestion}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: insets.bottom + Spacing.sm,
            backgroundColor: theme.backgroundRoot,
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              { color: theme.text },
              Platform.OS === "web" && ({ outlineStyle: "none" } as any),
            ]}
            placeholder="Describe your task..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: input.trim() ? theme.primary : 'transparent',
                opacity: pressed && input.trim() ? 0.8 : 1,
              },
            ]}
            onPress={handleSend}
            disabled={!input.trim() || createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather
                name="send"
                size={20}
                color={input.trim() ? "#fff" : theme.textSecondary}
              />
            )}
          </Pressable>
        </View>
        <View style={styles.creditInfo}>
          <Feather name="zap" size={12} color={theme.textSecondary} />
          <ThemedText style={[styles.creditText, { color: theme.textSecondary }]}>
            1 credit per task
          </ThemedText>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  assistantMessageContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    marginLeft: "auto",
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  thinkingContainer: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  suggestionsContainer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  suggestionsTitle: {
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  suggestionsList: {
    gap: Spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  creditInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  creditText: {
    fontSize: 11,
  },
});
