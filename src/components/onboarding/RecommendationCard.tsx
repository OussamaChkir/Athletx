import { StyleSheet, View } from "react-native";
import { Star } from "lucide-react-native";
import { AppText } from "@/components/kit";
import { colors, radius, spacing } from "@/lib/theme";

type Props = { hint: string; value: string };

/** Lime-outlined suggestion, e.g. "Based on your profile, we recommend 5 days / week". */
export function RecommendationCard({ hint, value }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Star size={20} color={colors.textOnAccent} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyMedium" color="textSecondary">
          {hint}
        </AppText>
        <AppText variant="titleSmall" color="accent">
          {value}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  badge: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 2 },
});
