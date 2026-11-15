import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { AppText, Button } from "@/components/kit";
import { colors, spacing } from "@/lib/theme";
import { useOnboardingStore } from "@/store/onboarding-store";

const BACKGROUND = require("../../assets/images/splashbackground.png");
const LOGO = require("../../assets/images/iconwithtext.png");

/** Dark green wash over the photo: lighter in the middle so the logo stays readable, solid at the edges. */
function GreenOverlay() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#06150d" stopOpacity={0.78} />
          <Stop offset="0.5" stopColor="#0a2415" stopOpacity={0.7} />
          <Stop offset="1" stopColor="#04100a" stopOpacity={0.94} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#wash)" />
    </Svg>
  );
}

export function SplashScreen() {
  const isCompleted = useOnboardingStore((s) => s.isCompleted);
  const insets = useSafeAreaInsets();

  const [fade] = useState(() => new Animated.Value(0));
  const [rise] = useState(() => new Animated.Value(24));
  const [buttonFade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (isCompleted) {
      router.replace("/(tabs)" as any);
      return;
    }
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(rise, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(buttonFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [isCompleted, fade, rise, buttonFade]);

  return (
    <View style={styles.root}>
      <Image source={BACKGROUND} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
      <GreenOverlay />

      <Animated.View style={[styles.center, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <Image source={LOGO} style={styles.logo} contentFit="contain" accessibilityLabel="Athletx" />
        <AppText variant="titleSmall" color="accent" style={styles.tagline}>
          Train. Track. Progress.
        </AppText>
      </Animated.View>

      <Animated.View
        style={[styles.footer, { opacity: buttonFade, paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm }]}
      >
        <Button label="Get started" onPress={() => router.replace("/onboarding" as any)} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing["3xl"] },
  logo: { width: 300, height: 300 },
  tagline: { marginTop: -spacing["3xl"], textAlign: "center" },
  footer: { paddingHorizontal: spacing["2xl"], paddingTop: spacing.lg },
});
