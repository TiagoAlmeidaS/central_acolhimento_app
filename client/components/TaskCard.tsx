import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const priorityColors: Record<string, string> = {
  high: Colors.light.danger,
  medium: Colors.light.warning,
  low: Colors.light.success,
};

const categoryIcons: Record<string, string> = {
  work: "briefcase",
  personal: "user",
  shopping: "shopping-cart",
  health: "heart",
  finance: "dollar-sign",
  education: "book",
  general: "circle",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TaskCard({ task, onPress }: TaskCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const priorityColor = priorityColors[task.priority] || theme.primary;
  const categoryIcon = categoryIcons[task.category] || "circle";
  const isCompleted = task.status === "completed";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <View
            style={[
              styles.priorityIndicator,
              { backgroundColor: priorityColor },
            ]}
          />
          <View style={styles.textContent}>
            <ThemedText
              style={[
                styles.title,
                isCompleted && { textDecorationLine: "line-through", opacity: 0.6 },
              ]}
              numberOfLines={1}
            >
              {task.title}
            </ThemedText>
            <View style={styles.meta}>
              <View style={styles.categoryBadge}>
                <Feather
                  name={categoryIcon as any}
                  size={12}
                  color={theme.textSecondary}
                />
                <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
                  {task.category}
                </ThemedText>
              </View>
              <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
                {formatDate(task.createdAt)}
              </ThemedText>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  date: {
    fontSize: 12,
  },
});
