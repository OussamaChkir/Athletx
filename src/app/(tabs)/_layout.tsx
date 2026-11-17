import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Dumbbell, Library, ChartLine, BicepsFlexed, Settings } from "lucide-react-native";
import { TabBar } from "@/components/kit";
import { PremiumLaunchPopup } from "@/components/premium-popup";

export default function TabsLayout() {
  const { t } = useTranslation("home");
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
          title: t("tabs.train"),
          tabBarIcon: (p) => <Dumbbell {...p} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t("tabs.library"),
          tabBarIcon: (p) => <Library {...p} />,
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: t("tabs.exercises"),
          tabBarIcon: (p) => <BicepsFlexed {...p} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t("tabs.progress"),
          tabBarIcon: (p) => <ChartLine {...p} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: (p) => <Settings {...p} />,
        }}
      />
    </Tabs>
    </>
  );
}
