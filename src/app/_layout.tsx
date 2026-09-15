import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import mobileAds from "react-native-google-mobile-ads";

export default function Layout() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .catch((err) => console.warn("AdMob init error:", err));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#070b09" },
          headerTintColor: "#f2fff1",
          contentStyle: { backgroundColor: "#070b09" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="live" options={{ headerShown: false, presentation: "fullScreenModal" }} />
        <Stack.Screen name="exercise/[id]" options={{ title: "Exercise" }} />
        <Stack.Screen name="plan/new" options={{ presentation: "modal", title: "New Plan" }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: "card" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
