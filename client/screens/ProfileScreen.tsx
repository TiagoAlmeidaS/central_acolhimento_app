import React from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { CreditCard } from "@/components/CreditCard";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const avatarColors = [
  ["#2563EB", "#3B82F6"],
  ["#10B981", "#34D399"],
  ["#F59E0B", "#FBBF24"],
  ["#EF4444", "#F87171"],
  ["#8B5CF6", "#A78BFA"],
  ["#EC4899", "#F472B6"],
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, subscription, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const avatarPreset = (user?.avatarPreset || 1) - 1;
  const avatarColor = avatarColors[avatarPreset % avatarColors.length];

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  const rootNavigation = navigation.getParent()?.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubscription = () => {
    rootNavigation?.navigate("Subscription");
  };

  const handleSettings = () => {
    rootNavigation?.navigate("Settings");
  };

  const handleAnalytics = () => {
    rootNavigation?.navigate("Analytics");
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    danger = false,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <Feather
          name={icon as any}
          size={20}
          color={danger ? theme.danger : theme.text}
        />
        <ThemedText
          style={[
            styles.menuItemLabel,
            { color: danger ? theme.danger : theme.text },
          ]}
        >
          {label}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: avatarColor[0] },
          ]}
        >
          <ThemedText style={styles.avatarText}>{getInitials()}</ThemedText>
        </View>
        <ThemedText style={styles.displayName}>
          {user?.displayName || "User"}
        </ThemedText>
        <ThemedText style={[styles.email, { color: theme.textSecondary }]}>
          {user?.email}
        </ThemedText>
      </View>

      <CreditCard />

      <View style={styles.subscriptionCard}>
        <Pressable
          style={({ pressed }) => [
            styles.planCard,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleSubscription}
        >
          <View>
            <ThemedText style={[styles.planLabel, { color: theme.textSecondary }]}>
              Current Plan
            </ThemedText>
            <ThemedText style={styles.planName}>
              {subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "Free"}
            </ThemedText>
          </View>
          <View style={[styles.upgradeBadge, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.upgradeText}>Upgrade</ThemedText>
          </View>
        </Pressable>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="bar-chart-2" label="Usage Analytics" onPress={handleAnalytics} />
        <MenuItem icon="credit-card" label="Manage Subscription" onPress={handleSubscription} />
        <MenuItem icon="settings" label="Settings" onPress={handleSettings} />
        <MenuItem icon="log-out" label="Sign Out" onPress={handleLogout} danger />
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
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: 14,
  },
  subscriptionCard: {
    marginTop: Spacing.lg,
  },
  planCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  planLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
  },
  upgradeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  menu: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuItemLabel: {
    fontSize: 16,
  },
});
