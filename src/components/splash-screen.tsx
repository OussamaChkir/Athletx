import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { theme } from "@/lib/theme";
import { useOnboardingStore } from "@/store/onboarding-store";

const { width, height } = Dimensions.get("window");

export function SplashScreen() {
  const isCompleted = useOnboardingStore((s) => s.isCompleted);

  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(40));
  const [btnScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (isCompleted) {
      router.replace("/(tabs)" as any);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCompleted, fadeAnim, slideAnim]);

  const handlePressIn = () =>
    Animated.spring(btnScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

  const handleGetStarted = () => {
    router.replace("/onboarding" as any);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/gymsplash.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Dark gradient overlay */}
      <View style={styles.overlay} />

      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Top badge */}
        <View style={styles.badge}>
          <View style={styles.badgeLine} />
          <Text style={styles.badgeText}>ELITE PERFORMANCE</Text>
        </View>

        {/* Hero headline */}
        <Text style={styles.heroLine1}>PUSH</Text>
        <Text style={styles.heroLine2}>YOUR</Text>
        <Text style={styles.heroLine3}>LIMITS</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Transform your physique with{"\n"}data-driven coaching and elite{"\n"}workout tracking.
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>WORKOUTS</Text>
            <Text style={styles.statValue}>2.4k+</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>ACTIVE USERS</Text>
            <Text style={styles.statValue}>15k+</Text>
          </View>
        </View>

        {/* CTA button */}
        <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
          <Pressable
            style={styles.ctaButton}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleGetStarted}
          >
            <Text style={styles.ctaText}>GET STARTED</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </Pressable>
        </Animated.View>


      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width,
    height,
    backgroundColor: theme.background,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(5,10,7,0.72)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
    justifyContent: "flex-end",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  badgeLine: {
    width: 28,
    height: 2,
    backgroundColor: theme.neon,
    borderRadius: 2,
  },
  badgeText: {
    color: theme.neon,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
  },
  heroLine1: {
    color: theme.text,
    fontSize: 72,
    fontWeight: "900",
    lineHeight: 72,
    letterSpacing: -2,
  },
  heroLine2: {
    color: theme.text,
    fontSize: 72,
    fontWeight: "900",
    lineHeight: 76,
    letterSpacing: -2,
  },
  heroLine3: {
    color: theme.neon,
    fontSize: 72,
    fontWeight: "900",
    lineHeight: 76,
    letterSpacing: -2,
    marginBottom: 20,
  },
  tagline: {
    color: "rgba(242,255,241,0.70)",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginBottom: 32,
  },
  stat: {
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(242,255,241,0.15)",
  },
  statLabel: {
    color: "rgba(242,255,241,0.45)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  statValue: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  ctaButton: {
    backgroundColor: theme.neon,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  ctaText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  ctaArrow: {
    color: theme.background,
    fontSize: 18,
    fontWeight: "900",
  },
});

