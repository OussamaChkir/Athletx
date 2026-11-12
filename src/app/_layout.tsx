import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initAds } from "@/lib/ads";
import { initPurchases } from "@/lib/purchases";
import { useAppFonts } from "@/lib/fonts";
import { theme } from "@/lib/theme";

// Keep the native splash visible until Jost and Plus Jakarta Sans are ready.
void SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    initPurchases();
    // Consent form (where required) and SDK start; also preloads the first interstitial.
    void initAds();
  }, []);

  const fontsReady = fontsLoaded || fontError != null;

  useEffect(() => {
    // If a font fails to load the app still opens with the system font instead of hanging.
    if (fontsReady) void SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="live" options={{ headerShown: false, presentation: "fullScreenModal" }} />
        <Stack.Screen name="workout/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="exercise/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="plan/new" options={{ presentation: "modal", title: "New Plan" }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="weigh-ins" options={{ headerShown: false, presentation: "card" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
