import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";

import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import VoiceInputScreen from "@/screens/VoiceInputScreen";
import TextInputScreen from "@/screens/TextInputScreen";
import TaskDetailScreen from "@/screens/TaskDetailScreen";
import SubscriptionScreen from "@/screens/SubscriptionScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import AnalyticsScreen from "@/screens/AnalyticsScreen";
import PaymentHistoryScreen from "@/screens/PaymentHistoryScreen";
import AIChatScreen from "@/screens/AIChatScreen";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  VoiceInput: undefined;
  TextInput: undefined;
  TaskDetail: { taskId: string };
  Subscription: undefined;
  Settings: undefined;
  Analytics: undefined;
  PaymentHistory: undefined;
  AIChat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.tabIconSelected} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VoiceInput"
            component={VoiceInputScreen}
            options={{
              presentation: "modal",
              headerTitle: "Voice Input",
            }}
          />
          <Stack.Screen
            name="TextInput"
            component={TextInputScreen}
            options={{
              presentation: "modal",
              headerTitle: "New Task",
            }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{
              headerTitle: "Task Details",
            }}
          />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{
              headerTitle: "Subscription",
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerTitle: "Settings",
            }}
          />
          <Stack.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{
              headerTitle: "Usage Analytics",
            }}
          />
          <Stack.Screen
            name="PaymentHistory"
            component={PaymentHistoryScreen}
            options={{
              headerTitle: "Payment History",
            }}
          />
          <Stack.Screen
            name="AIChat"
            component={AIChatScreen}
            options={{
              presentation: "modal",
              headerTitle: "TaskNote AI",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              presentation: "modal",
              headerTitle: "Create Account",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
