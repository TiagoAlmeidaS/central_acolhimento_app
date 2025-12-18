import React from "react";
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedRequest } from "@/lib/query-client";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type TaskDetailRouteProp = RouteProp<RootStackParamList, "TaskDetail">;

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  aiNotes: string | null;
  createdAt: string;
  completedAt: string | null;
}

const priorityColors: Record<string, string> = {
  high: Colors.light.danger,
  medium: Colors.light.warning,
  low: Colors.light.success,
};

export default function TaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { token } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<TaskDetailRouteProp>();
  const queryClient = useQueryClient();

  const { taskId } = route.params;

  const { data: task, isLoading } = useQuery({
    queryKey: ["/api/tasks", taskId],
    queryFn: async () => {
      if (!token) return null;
      const response = await authenticatedRequest(`/api/tasks/${taskId}`, token);
      if (!response.ok) throw new Error("Failed to fetch task");
      return response.json();
    },
    enabled: !!token && !!taskId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!token) throw new Error("Not authenticated");
      const response = await authenticatedRequest(`/api/tasks/${taskId}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", taskId] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const response = await authenticatedRequest(`/api/tasks/${taskId}`, token, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      navigation.goBack();
    },
  });

  const handleComplete = () => {
    updateTaskMutation.mutate(task?.status === "completed" ? "pending" : "completed");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTaskMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Task not found</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>{task.title}</ThemedText>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: priorityColors[task.priority] || theme.primary }]}>
            <ThemedText style={styles.badgeText}>{task.priority}</ThemedText>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={[styles.badgeText, { color: theme.text }]}>{task.category}</ThemedText>
          </View>
          {task.status === "completed" && (
            <View style={[styles.badge, { backgroundColor: Colors.light.success }]}>
              <Feather name="check" size={12} color="#fff" />
              <ThemedText style={styles.badgeText}>Completed</ThemedText>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Description
        </ThemedText>
        <ThemedText style={styles.description}>{task.description}</ThemedText>
      </View>

      {task.aiNotes ? (
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.sectionHeader}>
            <Feather name="zap" size={16} color={theme.primary} />
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary, marginLeft: Spacing.xs }]}>
              AI Insights
            </ThemedText>
          </View>
          <ThemedText style={styles.description}>{task.aiNotes}</ThemedText>
        </View>
      ) : null}

      <View style={styles.metadata}>
        <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </ThemedText>
        {task.completedAt ? (
          <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
            Completed: {new Date(task.completedAt).toLocaleDateString()}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          onPress={handleComplete}
          disabled={updateTaskMutation.isPending}
          style={[
            styles.actionButton,
            { backgroundColor: task.status === "completed" ? theme.warning : theme.success },
          ]}
        >
          {task.status === "completed" ? "Mark Pending" : "Mark Complete"}
        </Button>
        <Button
          onPress={handleDelete}
          disabled={deleteTaskMutation.isPending}
          style={[styles.actionButton, { backgroundColor: theme.danger }]}
        >
          Delete Task
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textTransform: "capitalize",
  },
  section: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 16,
  },
  metadata: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 12,
  },
  actions: {
    gap: Spacing.md,
  },
  actionButton: {
    height: Spacing.buttonHeight,
  },
});
