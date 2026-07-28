import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
  User,
} from "lucide-react-native";
import { theme } from "@/lib/theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { router } from "expo-router";

function SettingsRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Icon size={20} color={theme.neon} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <ChevronRight size={18} color={theme.muted} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const store = useOnboardingStore();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <SettingsRow icon={User} label="Edit Profile" />
          <SettingsRow icon={Bell} label="Notifications" />
          <SettingsRow icon={Moon} label="Appearance" />
          <SettingsRow icon={Shield} label="Privacy" />
          <SettingsRow icon={HelpCircle} label="Help & Support" />
        </View>

        <Pressable
          style={styles.resetBtn}
          onPress={() => {
            store.reset();
            router.replace("/onboarding" as any);
          }}
        >
          <LogOut size={18} color={theme.danger} />
          <Text style={styles.resetText}>Reset Onboarding</Text>
        </Pressable>

        <Text style={styles.version}>ATHLETX v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    padding: 24,
    gap: 24,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "900",
    paddingTop: 16,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(8, 253, 142, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.danger,
  },
  resetText: {
    color: theme.danger,
    fontSize: 15,
    fontWeight: "700",
  },
  version: {
    color: theme.muted,
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 2,
  },
});
