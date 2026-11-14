import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/kit";
import { spacing } from "@/lib/theme";

type Props = {
  /** Start of the question, in white. */
  title: string;
  /** Key words at the end of the question, in lime. */
  highlight: string;
  subtitle?: string;
};

/** Question and helper text at the top of an onboarding step. */
export function StepTitle({ title, highlight, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="titleLarge" accessibilityRole="header">
        {title} <AppText variant="titleLarge" color="accent">{highlight}</AppText>
      </AppText>
      {subtitle ? (
        <AppText variant="bodyLarge" color="textSecondary">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing["2xl"] },
});
