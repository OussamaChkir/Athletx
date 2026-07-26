import { View, StyleSheet, Text, Animated } from "react-native";
import { theme } from "@/lib/theme";
import { useEffect, useRef } from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progressPercent = Math.min(Math.max(currentStep / totalSteps, 0), 1);
  const animatedWidth = useRef(new Animated.Value(progressPercent)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progressPercent,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  const displayPercentage = Math.round(progressPercent * 100);

  return (
    <View style={styles.container}>
      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, { width: widthInterpolated }]} />
      </View>
      <Text style={styles.text}>{displayPercentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  barBg: {
    flex: 1,
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: theme.neon,
    borderRadius: 2,
  },
  text: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    width: 32,
    textAlign: "right",
  },
});
