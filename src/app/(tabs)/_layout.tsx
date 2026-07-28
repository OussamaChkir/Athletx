import { Tabs } from "expo-router";
import { Dumbbell, Library, ChartLine, ListMusic, Settings } from "lucide-react-native";
import { theme } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.neon,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
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
          title: "Exercises",
          tabBarIcon: (p) => <ListMusic {...p} />,
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: "Library",
          tabBarIcon: (p) => <Library {...p} />,
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
  );
}
