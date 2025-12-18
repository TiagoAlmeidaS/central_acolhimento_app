import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, authenticatedRequest, getApiUrl } from "@/lib/query-client";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  stripePriceId: string | null;
}

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { subscription, token, refreshUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["/api/subscription/plans"],
    queryFn: async () => {
      const response = await apiRequest("/api/subscription/plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      return response.json();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ priceId, planId }: { priceId: string; planId: string }) => {
      const response = await authenticatedRequest(
        "/api/stripe/create-checkout-session",
        token!,
        {
          method: "POST",
          body: JSON.stringify({ priceId, planId }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.url) {
        if (Platform.OS === "web") {
          window.open(data.url, "_blank");
        } else {
          await WebBrowser.openBrowserAsync(data.url);
        }
        await refreshUser();
      }
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to start checkout");
    },
    onSettled: () => {
      setLoadingPlan(null);
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedRequest(
        "/api/stripe/create-portal-session",
        token!,
        { method: "POST" }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open billing portal");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.url) {
        if (Platform.OS === "web") {
          window.open(data.url, "_blank");
        } else {
          await WebBrowser.openBrowserAsync(data.url);
        }
      }
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to open billing portal");
    },
  });

  const handleSelectPlan = async (plan: Plan) => {
    if (!plan.stripePriceId) {
      if (plan.id === "free") {
        Alert.alert("Free Plan", "You're already on the free plan or need to cancel your subscription through the billing portal.");
        return;
      }
      Alert.alert("Coming Soon", "This plan is not yet available for purchase. Please check back soon.");
      return;
    }

    setLoadingPlan(plan.id);
    checkoutMutation.mutate({ priceId: plan.stripePriceId, planId: plan.id });
  };

  const handleManageSubscription = () => {
    portalMutation.mutate();
  };

  const currentPlan = subscription?.plan || "free";
  const hasStripeSubscription = !!subscription?.stripeSubscriptionId;

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
      <View style={[styles.currentPlanCard, { backgroundColor: theme.primary }]}>
        <View>
          <ThemedText style={styles.currentPlanLabel}>Current Plan</ThemedText>
          <ThemedText style={styles.currentPlanName}>
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
          </ThemedText>
        </View>
        <View style={styles.creditsInfo}>
          <ThemedText style={styles.creditsValue}>
            {subscription?.credits || 0}
          </ThemedText>
          <ThemedText style={styles.creditsLabel}>
            credits left
          </ThemedText>
        </View>
      </View>

      {hasStripeSubscription ? (
        <Button
          onPress={handleManageSubscription}
          style={[styles.manageButton, { backgroundColor: theme.backgroundSecondary }]}
          disabled={portalMutation.isPending}
        >
          {portalMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <>
              <Feather name="settings" size={18} color={theme.text} />
              <ThemedText style={{ color: theme.text, fontWeight: "600", marginLeft: Spacing.sm }}>
                Manage Subscription
              </ThemedText>
            </>
          )}
        </Button>
      ) : null}

      <ThemedText style={styles.sectionTitle}>Available Plans</ThemedText>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        (plans || []).map((plan: Plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          const isLoading = loadingPlan === plan.id;

          return (
            <Pressable
              key={plan.id}
              style={({ pressed }) => [
                styles.planCard,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: isCurrentPlan ? theme.primary : theme.border,
                  borderWidth: isCurrentPlan ? 2 : 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              disabled={isCurrentPlan || isLoading}
            >
              <View style={styles.planHeader}>
                <View>
                  <ThemedText style={styles.planName}>{plan.name}</ThemedText>
                  <ThemedText style={[styles.planCredits, { color: theme.textSecondary }]}>
                    {plan.credits >= 9999 ? "Unlimited" : plan.credits} credits/month
                  </ThemedText>
                </View>
                <View style={styles.priceContainer}>
                  <ThemedText style={styles.planPrice}>
                    ${plan.price.toFixed(2)}
                  </ThemedText>
                  <ThemedText style={[styles.pricePeriod, { color: theme.textSecondary }]}>
                    /month
                  </ThemedText>
                </View>
              </View>

              <View style={styles.features}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Feather name="check" size={16} color={theme.success} />
                    <ThemedText style={[styles.featureText, { color: theme.text }]}>
                      {feature}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {isCurrentPlan ? (
                <View style={[styles.currentBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.currentBadgeText}>Current Plan</ThemedText>
                </View>
              ) : (
                <Button
                  style={[
                    styles.selectButton,
                    plan.id === "free"
                      ? { backgroundColor: theme.backgroundSecondary }
                      : {},
                  ]}
                  onPress={() => handleSelectPlan(plan)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={plan.id === "free" ? theme.text : Colors.light.buttonText} />
                  ) : (
                    <ThemedText
                      style={{
                        color: plan.id === "free" ? theme.text : Colors.light.buttonText,
                        fontWeight: "600",
                      }}
                    >
                      {plan.price === 0 ? "Downgrade" : plan.stripePriceId ? "Subscribe" : "Coming Soon"}
                    </ThemedText>
                  )}
                </Button>
              )}
            </Pressable>
          );
        })
      )}

      <View style={styles.note}>
        <Feather name="shield" size={16} color={theme.textSecondary} />
        <ThemedText style={[styles.noteText, { color: theme.textSecondary }]}>
          Payments are securely processed by Stripe. Your payment information is never stored on our servers.
        </ThemedText>
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
  currentPlanCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  currentPlanLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: Spacing.xs,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  creditsInfo: {
    alignItems: "flex-end",
  },
  creditsValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  creditsLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  planCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  planCredits: {
    fontSize: 14,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
  },
  pricePeriod: {
    fontSize: 12,
  },
  features: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
  },
  currentBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  currentBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  selectButton: {
    marginTop: Spacing.xs,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
  },
});
