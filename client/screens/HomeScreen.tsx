import React, { useCallback } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { CreditCard } from "@/components/CreditCard";
import { TaskCard } from "@/components/TaskCard";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedRequest } from "@/lib/query-client";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { token, subscription } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: tasks, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      if (!token) return [];
      const response = await authenticatedRequest("/api/tasks", token);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    enabled: !!token,
  });

  const pendingTasks = (tasks || []).filter((task: Task) => task.status !== "completed");
  const todayTasks = pendingTasks.filter((task: Task) => {
    const taskDate = new Date(task.createdAt).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });

  const handleTaskPress = useCallback((taskId: string) => {
    navigation.navigate("TaskDetail", { taskId });
  }, [navigation]);

  const handleAddTask = () => {
    navigation.navigate("TextInput");
  };

  const renderTask = useCallback(({ item }: { item: Task }) => (
    <TaskCard task={item} onPress={() => handleTaskPress(item.id)} />
  ), [handleTaskPress]);

  const renderHeader = () => (
    <View style={styles.header}>
      <CreditCard />

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statValue, { color: theme.primary }]}>
            {todayTasks.length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Today
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statValue, { color: theme.success }]}>
            {(tasks || []).filter((t: Task) => t.status === "completed").length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Completed
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statValue, { color: theme.warning }]}>
            {pendingTasks.length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Pending
          </ThemedText>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Active Tasks</ThemedText>
        <Pressable
          onPress={handleAddTask}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="plus" size={20} color={Colors.light.buttonText} />
        </Pressable>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="check-circle" size={48} color={theme.textSecondary} />
      <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
        No tasks yet
      </ThemedText>
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Tap the microphone button to add your first task
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + 80 + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={pendingTasks}
      keyExtractor={(item) => item.id}
      renderItem={renderTask}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing["2xl"],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
});
