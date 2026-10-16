import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckIcon, CrownIcon, XIcon } from "lucide-react-native";
import { theme } from "@/lib/theme";
import {
  PREMIUM_BENEFITS,
  PREMIUM_PLANS,
  PRIVACY_URL,
  TERMS_URL,
  YEARLY_SAVINGS_PERCENT,
  formatUsd,
  type PlanId,
} from "@/lib/premium";
import { purchasePlan, restorePurchases, type PurchaseResult } from "@/lib/purchases";
import { usePremiumStore } from "@/store/premium-store";

/* ── Plan card ── */
function PlanCard({
  planId,
  selected,
  onSelect,
}: {
  planId: PlanId;
  selected: boolean;
  onSelect: () => void;
}) {
  const plan = PREMIUM_PLANS[planId];
  const isYearly = planId === "yearly";
  const perMonth = isYearly ? `${formatUsd(plan.price / 12)} / month` : "Billed every month";

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${plan.title} plan, ${formatUsd(plan.price)} per ${plan.period}`}
      style={[styles.planCard, selected && styles.planCardSelected]}
    >
      {isYearly && (
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>BEST VALUE · SAVE {YEARLY_SAVINGS_PERCENT}%</Text>
        </View>
      )}

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <CheckIcon size={14} color={theme.background} strokeWidth={3.5} />}
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planSub}>{perMonth}</Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.planPrice}>{formatUsd(plan.price)}</Text>
        <Text style={styles.planPeriod}>per {plan.period}</Text>
      </View>
    </Pressable>
  );
}

/* ── Popup ── */
export function PremiumPopup({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const setPremium = usePremiumStore((s) => s.setPremium);

  const [selected, setSelected] = useState<PlanId>("yearly");
  const [busy, setBusy] = useState(false);
  const [btnScale] = useState(() => new Animated.Value(1));

  const plan = PREMIUM_PLANS[selected];
  const storeName = Platform.OS === "android" ? "Google Play" : "Apple ID";

  const handleSelect = (id: PlanId) => {
    if (id === selected) return;
    Haptics.selectionAsync().catch(() => {});
    setSelected(id);
  };

  const handleResult = (result: PurchaseResult) => {
    if (result.status === "success") {
      setPremium(result.plan);
      onClose();
    } else if (result.status === "unavailable") {
      Alert.alert("Coming soon", "Premium subscriptions aren't available in this version yet.");
    }
  };

  const run = async (action: () => Promise<PurchaseResult>) => {
    if (busy) return;
    setBusy(true);
    try {
      handleResult(await action());
    } catch {
      Alert.alert("Something went wrong", "We couldn't complete that. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const pressIn = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.topAccent} />

          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={styles.closeBtn}
          >
            <XIcon size={18} color={theme.muted} />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            bounces={false}
          >
            {/* Header */}
            <View style={styles.crownWrap}>
              <CrownIcon size={30} color={theme.background} strokeWidth={2.4} />
            </View>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowLine} />
              <Text style={styles.eyebrow}>ATHLETX PREMIUM</Text>
              <View style={styles.eyebrowLine} />
            </View>
            <Text style={styles.title}>
              Unlock your{"\n"}
              <Text style={{ color: theme.neon }}>full potential</Text>
            </Text>

            {/* Benefits */}
            <View style={styles.benefits}>
              {PREMIUM_BENEFITS.map(({ icon: Icon, title, description }) => (
                <View key={title} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Icon size={20} color={theme.neon} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.benefitTitle}>{title}</Text>
                    <Text style={styles.benefitDesc}>{description}</Text>
                  </View>
                  <CheckIcon size={18} color={theme.neon} strokeWidth={3} />
                </View>
              ))}
            </View>

            {/* Plans */}
            <View style={styles.plans} accessibilityRole="radiogroup">
              <PlanCard planId="yearly" selected={selected === "yearly"} onSelect={() => handleSelect("yearly")} />
              <PlanCard planId="monthly" selected={selected === "monthly"} onSelect={() => handleSelect("monthly")} />
            </View>

            {/* CTA */}
            <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
              <Pressable
                style={[styles.cta, busy && { opacity: 0.7 }]}
                onPressIn={pressIn}
                onPressOut={pressOut}
                onPress={() => run(() => purchasePlan(selected))}
                disabled={busy}
                accessibilityRole="button"
              >
                {busy ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={styles.ctaText}>CONTINUE</Text>
                )}
              </Pressable>
            </Animated.View>

            <Text style={styles.finePrint}>
              {formatUsd(plan.price)} per {plan.period}. Cancel anytime. Your subscription renews automatically
              unless canceled at least 24 hours before the end of the current period, and payment is charged to
              your {storeName} account.
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable onPress={() => run(restorePurchases)} hitSlop={8}>
                <Text style={styles.footerLink}>Restore</Text>
              </Pressable>
              <Text style={styles.footerDot}>•</Text>
              <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
                <Text style={styles.footerLink}>Terms</Text>
              </Pressable>
              <Text style={styles.footerDot}>•</Text>
              <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
                <Text style={styles.footerLink}>Privacy</Text>
              </Pressable>
            </View>

            <Pressable onPress={onClose} hitSlop={8} style={styles.laterBtn}>
              <Text style={styles.laterText}>Maybe later</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ── Shows the popup once each time the app is opened ── */
let shownThisLaunch = false;

export function PremiumLaunchPopup() {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const hasHydrated = usePremiumStore((s) => s.hasHydrated);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasHydrated || isPremium || shownThisLaunch) return;
    shownThisLaunch = true;
    // Small delay so the home screen is on screen before the sheet slides up.
    const t = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(t);
  }, [hasHydrated, isPremium]);

  return <PremiumPopup visible={visible && !isPremium} onClose={() => setVisible(false)} />;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.border,
    maxHeight: "94%",
    overflow: "hidden",
  },
  topAccent: {
    height: 3,
    backgroundColor: theme.neon,
    opacity: 0.85,
  },
  closeBtn: {
    position: "absolute",
    top: 18,
    right: 16,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 8,
    alignItems: "center",
  },
  crownWrap: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: theme.neon,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: theme.neon,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  eyebrowLine: {
    width: 22,
    height: 2,
    borderRadius: 2,
    backgroundColor: theme.neon,
  },
  eyebrow: {
    color: theme.neon,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
    marginBottom: 16,
  },
  benefits: {
    width: "100%",
    gap: 8,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.surfaceRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(8,253,142,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
  },
  benefitDesc: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 1,
  },
  plans: {
    width: "100%",
    gap: 12,
    marginBottom: 14,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.surfaceRaised,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  planCardSelected: {
    borderColor: theme.neon,
    backgroundColor: "rgba(8,253,142,0.07)",
  },
  planBadge: {
    position: "absolute",
    top: -11,
    right: 14,
    backgroundColor: theme.neon,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  planBadgeText: {
    color: theme.background,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: theme.neon,
    backgroundColor: theme.neon,
  },
  planTitle: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "800",
  },
  planSub: {
    color: theme.muted,
    fontSize: 12,
  },
  planPrice: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  planPeriod: {
    color: theme.muted,
    fontSize: 11,
  },
  cta: {
    backgroundColor: theme.neon,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  ctaText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  finePrint: {
    color: theme.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  footerLink: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.8,
  },
  footerDot: {
    color: theme.muted,
    fontSize: 10,
  },
  laterBtn: {
    marginTop: 8,
    paddingVertical: 6,
  },
  laterText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "600",
  },
});
