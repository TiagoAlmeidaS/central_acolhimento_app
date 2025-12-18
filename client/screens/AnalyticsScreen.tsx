import React from "react";
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AnalyticsData {
  currentCredits: number;
  monthlyAllocation: number;
  totalUsedLast30Days: number;
  totalAddedLast30Days: number;
  dailyUsage: Record<string, number>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string;
  }>;
}

const { width: screenWidth } = Dimensions.get("window");
const BAR_COUNT = 14;
const BAR_WIDTH = (screenWidth - Spacing.lg * 2 - Spacing.md * 2 - BAR_COUNT * 4) / BAR_COUNT;

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/credits/analytics"],
    queryFn: async () => {
      const response = await authenticatedRequest("/api/credits/analytics", token!, {});
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: !!token,
    refetchInterval: 30000,
  });

  const getChartData = () => {
    const days: { date: string; usage: number }[] = [];
    for (let i = BAR_COUNT - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        usage: data?.dailyUsage[dateStr] || 0,
      });
    }
    return days;
  };

  const chartData = getChartData();
  const maxUsage = Math.max(...chartData.map((d) => d.usage), 1);

  const usagePercentage = data
    ? Math.round((data.totalUsedLast30Days / Math.max(data.monthlyAllocation, 1)) * 100)
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="alert-circle" size={48} color={theme.danger} />
        <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>
          Failed to load analytics
        </ThemedText>
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
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.statsRow}>
        <Card style={{ ...styles.statCard, flex: 1 }}>
          <View style={[styles.statIcon, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="zap" size={20} color={theme.primary} />
          </View>
          <ThemedText style={[styles.statValue, { color: theme.text }]}>
            {data?.currentCredits || 0}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Credits Left
          </ThemedText>
        </Card>
        
        <Card style={{ ...styles.statCard, flex: 1 }}>
          <View style={[styles.statIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="trending-up" size={20} color={theme.success} />
          </View>
          <ThemedText style={[styles.statValue, { color: theme.text }]}>
            {data?.totalUsedLast30Days || 0}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Used (30 days)
          </ThemedText>
        </Card>
      </View>

      <Card style={styles.progressCard}>
        <ThemedText style={styles.sectionTitle}>Monthly Usage</ThemedText>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor:
                    usagePercentage > 90
                      ? theme.danger
                      : usagePercentage > 70
                      ? theme.warning
                      : theme.primary,
                  width: `${Math.min(usagePercentage, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.progressLabels}>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
            {data?.totalUsedLast30Days || 0} used
          </ThemedText>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
            {data?.monthlyAllocation || 0} total
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.chartCard}>
        <ThemedText style={styles.sectionTitle}>Daily Usage (Last 2 Weeks)</ThemedText>
        <View style={styles.chart}>
          {chartData.map((day, index) => (
            <View key={day.date} style={styles.barContainer}>
              <View style={[styles.barWrapper, { width: BAR_WIDTH }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max((day.usage / maxUsage) * 100, 4)}%`,
                      backgroundColor: day.usage > 0 ? theme.primary : theme.border,
                    },
                  ]}
                />
              </View>
              {index % 2 === 0 ? (
                <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]}>
                  {new Date(day.date).getDate()}
                </ThemedText>
              ) : null}
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.transactionsCard}>
        <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
        {!data?.recentTransactions?.length ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={32} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No transactions yet
            </ThemedText>
          </View>
        ) : (
          data.recentTransactions.slice(0, 10).map((transaction) => (
            <View
              key={transaction.id}
              style={[styles.transactionRow, { borderBottomColor: theme.border }]}
            >
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        transaction.amount > 0
                          ? theme.success + "20"
                          : theme.danger + "20",
                    },
                  ]}
                >
                  <Feather
                    name={transaction.amount > 0 ? "plus" : "minus"}
                    size={14}
                    color={transaction.amount > 0 ? theme.success : theme.danger}
                  />
                </View>
                <View>
                  <ThemedText style={styles.transactionType}>
                    {transaction.type === "ai_task" ? "AI Task" : transaction.type}
                  </ThemedText>
                  <ThemedText style={[styles.transactionDate, { color: theme.textSecondary }]}>
                    {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
                  </ThemedText>
                </View>
              </View>
              <ThemedText
                style={[
                  styles.transactionAmount,
                  { color: transaction.amount > 0 ? theme.success : theme.danger },
                ]}
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount}
              </ThemedText>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statCard: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  progressCard: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  progressBarContainer: {
    marginBottom: Spacing.xs,
  },
  progressBarBg: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartCard: {
    padding: Spacing.md,
  },
  chart: {
    flexDirection: "row",
    height: 120,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    height: 100,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: BorderRadius.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: Spacing.xs,
  },
  transactionsCard: {
    padding: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  transactionIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
});
