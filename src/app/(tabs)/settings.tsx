import { Alert, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Bell, Camera, CircleUser, Crown, LifeBuoy, LogOut, ShieldCheck, User } from "lucide-react-native";
import { colors, radius, spacing, theme } from "@/lib/theme";
import { formatHeightInput } from "@/lib/weight";
import { AppText, Button, ListRow } from "@/components/kit";
import { LanguageSetting } from "@/components/LanguageSetting";
import { PremiumPopup } from "@/components/premium-popup";
import { useOnboardingStore } from "@/store/onboarding-store";
import { usePremiumStore } from "@/store/premium-store";
import { useProfileStore } from "@/store/profile-store";

const WEBSITE_URL = "https://oussamachkir.github.io/athletx-website/";
const PRIVACY_URL = `${WEBSITE_URL}privacy.html`;

function ProfileStat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="statNumber" color="accent">
        {value}
        {unit ? (
          <AppText variant="labelMedium" color="textSecondary">
            {" "}
            {unit}
          </AppText>
        ) : null}
      </AppText>
      <AppText variant="bodyMedium" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

const iconProps = { size: 20, color: colors.accent } as const;

/* ── Main screen ── */
export default function SettingsScreen() {
  const { t } = useTranslation("settings");
  const store = useOnboardingStore();
  const profile = useProfileStore();

  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [premiumVisible, setPremiumVisible] = useState(false);
  const isPremium = usePremiumStore((s) => s.isPremium);

  const displayName = profile.displayName.trim() || profile.username;
  const dash = "–";

  const requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert(t("permission.title"), t("permission.message"));
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


  const handleLogOut = () => {
    Alert.alert(t("logOutAlert.title"), t("logOutAlert.message"), [
      { text: t("logOutAlert.cancel"), style: "cancel" },
      {
        text: t("logOutAlert.confirm"),
        style: "destructive",
        onPress: () => {
          store.reset();
          router.replace("/onboarding" as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AppText variant="titleLarge" style={{ paddingTop: spacing.md }}>
          {t("title")}
        </AppText>

        {/* Profile */}
        <View style={styles.profile}>
          <Pressable
            style={styles.avatarRing}
            onPress={() => router.push("/edit-profile" as any)}
            accessibilityRole="button"
            accessibilityLabel={t("editPhoto")}
          >
            <View style={styles.avatar}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
              ) : (
                <User size={44} color={colors.textMuted} />
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Camera size={16} color={colors.textPrimary} />
            </View>
          </Pressable>
          <AppText variant="titleMedium">{displayName}</AppText>

          <View style={styles.statsRow}>
            <ProfileStat
              value={store.age != null ? String(store.age) : dash}
              unit={store.age != null ? t("stats.yearsUnit") : undefined}
              label={t("stats.age")}
            />
            <View style={styles.statDivider} />
            <ProfileStat
              value={store.weight.value != null ? String(store.weight.value) : dash}
              unit={store.weight.value != null ? store.weight.unit : undefined}
              label={t("stats.weight")}
            />
            <View style={styles.statDivider} />
            <ProfileStat
              value={store.height.value != null ? formatHeightInput(store.height.value, store.height.unit) : dash}
              unit={store.height.value != null ? store.height.unit : undefined}
              label={t("stats.height")}
            />
          </View>
        </View>

        {/* Premium */}
        <View style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <View style={styles.premiumIcon}>
              <Crown size={22} color={colors.accent} />
            </View>
            <AppText variant="titleMedium" color="textOnAccent">
              {isPremium ? t("premium.active") : t("premium.go")}
            </AppText>
          </View>
          <AppText variant="bodyLarge" color="textOnAccent">
            {isPremium
              ? t("premium.activeBody")
              : t("premium.unlockBody")}
          </AppText>
          {!isPremium && <Button label={t("premium.upgrade")} variant="dark" onPress={() => setPremiumVisible(true)} />}
        </View>

        {/* General */}
        <View style={styles.group}>
          <AppText variant="labelLarge" color="textSecondary">
            {t("general.title")}
          </AppText>
          <ListRow
            icon={<CircleUser {...iconProps} />}
            title={t("general.personalInfo")}
            subtitle={t("general.personalInfoHint")}
            onPress={() => router.push("/edit-profile" as any)}
          />
          <ListRow
            icon={<Bell {...iconProps} />}
            title={t("general.notification")}
            subtitle={t("general.notificationHint")}
            onPress={() => setNotifModalVisible(true)}
          />
          <ListRow
            icon={<ShieldCheck {...iconProps} />}
            title={t("general.privacy")}
            subtitle={t("general.privacyHint")}
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <LanguageSetting />
        </View>

        {/* Support */}
        <View style={styles.group}>
          <AppText variant="labelLarge" color="textSecondary">
            {t("support.title")}
          </AppText>
          <ListRow
            icon={<LifeBuoy {...iconProps} />}
            title={t("support.help")}
            subtitle={t("support.helpHint")}
            onPress={() => Linking.openURL(WEBSITE_URL)}
          />
          <ListRow
            icon={<LogOut size={20} color={colors.danger} />}
            title={t("support.logOut")}
            subtitle={t("support.logOutHint")}
            danger
            onPress={handleLogOut}
          />
        </View>

        <AppText variant="caption" color="textMuted" style={{ textAlign: "center" }}>
          Athletx v1.2.2
        </AppText>
      </ScrollView>

      <PremiumPopup visible={premiumVisible} onClose={() => setPremiumVisible(false)} />

      {/* Notifications Modal */}
      <Modal visible={notifModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setNotifModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => { }}>
            <Text style={styles.modalTitle}>{t("notifications.title")}</Text>

            <View style={styles.modalRow}>
              <Text style={styles.modalRowText}>{t("notifications.enable")}</Text>
              <Switch
                value={profile.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ true: theme.neon, false: theme.border }}
              />
            </View>

            <View style={[styles.modalRow, { opacity: profile.notificationsEnabled ? 1 : 0.5 }]}>
              <View>
                <Text style={styles.modalRowText}>{t("notifications.workoutReminders")}</Text>
                <Text style={styles.modalRowSubtext}>{t("notifications.workoutRemindersHint")}</Text>
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
                <Text style={styles.modalRowText}>{t("notifications.hydration")}</Text>
                <Text style={styles.modalRowSubtext}>{t("notifications.hydrationHint")}</Text>
              </View>
              <Switch
                value={profile.hydrationMotivation}
                onValueChange={(val) => profile.updateProfile({ hydrationMotivation: val })}
                disabled={!profile.notificationsEnabled}
                trackColor={{ true: theme.neon, false: theme.border }}
              />
            </View>

            <Pressable style={styles.modalCloseBtn} onPress={() => setNotifModalVisible(false)}>
              <Text style={styles.modalCloseText}>{t("notifications.done")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  container: { paddingHorizontal: spacing.xl, gap: spacing["2xl"], paddingBottom: 120 },

  profile: { alignItems: "center", gap: spacing.md },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 92, height: 92 },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.bgApp,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", paddingTop: spacing.sm },
  stat: { flex: 1, alignItems: "center", gap: spacing.xs },
  statDivider: { width: 1, height: 36, backgroundColor: colors.bgSurface },

  premiumCard: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg },
  premiumHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.bgApp,
    alignItems: "center",
    justifyContent: "center",
  },

  group: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.lg },

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
});
