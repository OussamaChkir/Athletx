import { Pressable, ScrollView, StyleSheet, Text, View, Modal, Switch, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import * as Notifications from "expo-notifications";


import {
  Bell,
  ChevronRight,
  Edit2,
  HelpCircle,
  Link2,
  LogOut,
  Moon,
  Shield,
  User,
} from "lucide-react-native";
import { theme } from "@/lib/theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useProfileStore } from "@/store/profile-store";
import { router } from "expo-router";

/* ── Reusable settings row ── */
function SettingsRow({
  icon: Icon,
  label,
  onPress,
  badge,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  badge?: string;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Icon size={20} color={theme.neon} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <ChevronRight size={18} color={theme.muted} />
    </Pressable>
  );
}

/* ── Profile hero card ── */
function ProfileCard({ onPress }: { onPress: () => void }) {
  const profile = useProfileStore();

  const displayLabel = profile.displayName.trim() || profile.username;
  const handle = `@${profile.username}`;
  const shortId = profile.userId.slice(0, 8).toUpperCase();
  const initials = displayLabel
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join("") || "?";

  return (
    <Pressable style={styles.profileCard} onPress={onPress}>
      {/* Avatar */}
      <View style={styles.profileAvatar}>
        <Text style={styles.profileInitials}>{initials}</Text>
        {/* Neon ring glow */}
        <View style={styles.profileAvatarGlow} />
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.profileName} numberOfLines={1}>
          {displayLabel || "Set your name"}
        </Text>
        <Text style={styles.profileHandle} numberOfLines={1}>
          {handle}
        </Text>

        {/* Tags row */}
        <View style={styles.profileTagsRow}>
          <View style={styles.profileTag}>
            <Text style={styles.profileTagText}>#{shortId}</Text>
          </View>
          {profile.googleEmail && (
            <View style={[styles.profileTag, styles.profileTagGoogle]}>
              <Text style={[styles.profileTagText, { color: "#4285F4" }]}>
                G Connected
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Edit icon */}
      <View style={styles.profileEditBtn}>
        <Edit2 size={16} color={theme.neon} />
      </View>
    </Pressable>
  );
}

/* ── Main screen ── */
export default function SettingsScreen() {
  const store = useOnboardingStore();
  const profile = useProfileStore();
  
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Permission required', 'Please enable notifications in your phone settings.');
      profile.updateProfile({ notificationsEnabled: false });
      return false;
    }
    profile.updateProfile({ notificationsEnabled: true });
    return true;
  };


  const handleToggleNotifications = async (val: boolean) => {
    if (val) {
      const granted = await requestPermissions();
      if (!granted) return;
    }
    profile.updateProfile({ notificationsEnabled: val });
  };


  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Profile preview → tap to edit */}
        <ProfileCard onPress={() => router.push("/edit-profile" as any)} />

        {/* General */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.section}>
            <SettingsRow
              icon={User}
              label="Edit Profile"
              onPress={() => router.push("/edit-profile" as any)}
            />
            <SettingsRow
              icon={Link2}
              label="Connected Accounts"
              badge={profile.googleEmail ? "Google" : undefined}
              onPress={() => router.push("/edit-profile" as any)}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.section}>
            <SettingsRow icon={Bell} label="Notifications" onPress={() => setNotifModalVisible(true)} />
            <SettingsRow icon={Shield} label="Privacy" onPress={() => Linking.openURL('https://github.com/OussamaChkir/Athletx/blob/main/PRIVACY.md')} />
            <SettingsRow icon={HelpCircle} label="Help & Support" />
          </View>
        </View>

        {/* Reset */}
        <Pressable
          style={styles.resetBtn}
          onPress={() => {
            store.reset();
            router.replace("/onboarding" as any);
          }}
        >
          <LogOut size={18} color={theme.danger} />
          <Text style={styles.resetText}>Log out</Text>
        </Pressable>

        <Text style={styles.version}>ATHLETX v1.0.0</Text>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal visible={notifModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setNotifModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Notifications</Text>
            
            <View style={styles.modalRow}>
              <Text style={styles.modalRowText}>Enable Notifications</Text>
              <Switch 
                value={profile.notificationsEnabled} 
                onValueChange={handleToggleNotifications} 
                trackColor={{ true: theme.neon, false: theme.border }}
              />
            </View>

            <View style={[styles.modalRow, { opacity: profile.notificationsEnabled ? 1 : 0.5 }]}>
              <View>
                <Text style={styles.modalRowText}>Workout Reminders</Text>
                <Text style={styles.modalRowSubtext}>Daily reminder for your scheduled workout</Text>
              </View>
              <Switch 
                value={profile.workoutReminders} 
                onValueChange={(val) => profile.updateProfile({ workoutReminders: val })} 
                disabled={!profile.notificationsEnabled}
                trackColor={{ true: theme.neon, false: theme.border }}
              />
            </View>

            <View style={[styles.modalRow, { opacity: profile.notificationsEnabled ? 1 : 0.5 }]}>
              <View>
                <Text style={styles.modalRowText}>Hydration & Motivation</Text>
                <Text style={styles.modalRowSubtext}>Drink water and keep pushing!</Text>
              </View>
              <Switch 
                value={profile.hydrationMotivation} 
                onValueChange={(val) => profile.updateProfile({ hydrationMotivation: val })} 
                disabled={!profile.notificationsEnabled}
                trackColor={{ true: theme.neon, false: theme.border }}
              />
            </View>
            
            <Pressable style={styles.modalCloseBtn} onPress={() => setNotifModalVisible(false)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 16,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalRowText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "600",
  },
  modalRowSubtext: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 2,
    maxWidth: 200,
  },
  modalCloseBtn: {
    backgroundColor: theme.neon,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "800",
  },
  container: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "900",
    paddingTop: 8,
  },

  /* ── Profile card ── */
  profileCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: theme.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1a3d28",
    borderWidth: 2,
    borderColor: theme.neon,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  profileAvatarGlow: {
    position: "absolute",
    inset: -4,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: "rgba(8,253,142,0.2)",
  },
  profileInitials: {
    color: theme.neon,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  profileName: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "800",
  },
  profileHandle: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  profileTagsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  profileTag: {
    backgroundColor: "rgba(8,253,142,0.07)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(8,253,142,0.15)",
  },
  profileTagGoogle: {
    backgroundColor: "rgba(66,133,244,0.07)",
    borderColor: "rgba(66,133,244,0.2)",
  },
  profileTagText: {
    color: theme.neon,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontFamily: "monospace",
  },
  profileEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(8,253,142,0.08)",
    borderWidth: 1,
    borderColor: "rgba(8,253,142,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Section groups ── */
  sectionWrap: {
    gap: 8,
  },
  sectionLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    paddingHorizontal: 4,
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
  badge: {
    backgroundColor: "rgba(8,253,142,0.12)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
  },
  badgeText: {
    color: theme.neon,
    fontSize: 11,
    fontWeight: "800",
  },

  /* ── Reset ── */
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

  /* ── Footer ── */
  version: {
    color: theme.muted,
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 2,
  },
});
