import { Tabs } from "expo-router";
import { Dumbbell, Library, ChartLine, BicepsFlexed, Settings } from "lucide-react-native";
import { TabBar } from "@/components/kit";
import { PremiumLaunchPopup } from "@/components/premium-popup";

export default function TabsLayout() {
  return (
    <>
    <PremiumLaunchPopup />
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Workout",
          tabBarIcon: (p) => <Dumbbell {...p} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: (p) => <Library {...p} />,
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: "Exercises",
          tabBarIcon: (p) => <BicepsFlexed {...p} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Progress",
          tabBarIcon: (p) => <ChartLine {...p} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: (p) => <Settings {...p} />,
        }}
      />
    </Tabs>
    </>
  );
}
