import { SafeAreaView, StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { router } from "expo-router";
import { theme } from "@/lib/theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { ProgressBar } from "@/components/onboarding/ProgressBar";

// Step placeholders
import { StepGender } from "./steps/StepGender";
import { StepExperience } from "./steps/StepExperience";
import { StepFrequency } from "./steps/StepFrequency";
import { StepGoal } from "./steps/StepGoal";
import { StepLocation } from "./steps/StepLocation";
import { StepInjuries } from "./steps/StepInjuries";
import { StepFocus } from "./steps/StepFocus";
import { StepAge } from "./steps/StepAge";
import { StepHeight } from "./steps/StepHeight";
import { StepWeight } from "./steps/StepWeight";
import { StepGoalWeight } from "./steps/StepGoalWeight";
import { StepDuration } from "./steps/StepDuration";
import { StepSetupType } from "./steps/StepSetupType";
import { StepTargetFrequency } from "./steps/StepTargetFrequency";

const TOTAL_STEPS = 14;

export default function OnboardingScreen() {
  const store = useOnboardingStore();
  const { currentStep, nextStep, prevStep } = store;

  const handleBack = () => {
    if (currentStep === 1) {
      router.replace("/");
    } else {
      prevStep();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return store.gender !== null;
      case 2: return store.experience !== null;
      case 3: return store.currentFrequency !== null;
      case 4: return store.goal !== null;
      case 5: return store.location.length > 0;
      case 6: return true; // optional
      case 7: return store.focusArea.length > 0;
      case 8: return store.age !== null && store.age > 0;
      case 9: return store.height.value !== null && store.height.value > 0;
      case 10: return store.weight.value !== null && store.weight.value > 0;
      case 11: return store.goalWeight !== null && store.goalWeight > 0;
      case 12: return store.duration !== null;
      case 13: return store.setupType !== null;
      case 14: return store.targetFrequency !== null;
      default: return true;
    }
  };

  const isValid = isStepValid();

  const handleContinue = () => {
    if (!isValid) return;
    if (currentStep === TOTAL_STEPS) {
      router.replace("/(tabs)" as any);
    } else {
      nextStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepGender />;
      case 2: return <StepExperience />;
      case 3: return <StepFrequency />;
      case 4: return <StepGoal />;
      case 5: return <StepLocation />;
      case 6: return <StepInjuries />;
      case 7: return <StepFocus />;
      case 8: return <StepAge />;
      case 9: return <StepHeight />;
      case 10: return <StepWeight />;
      case 11: return <StepGoalWeight />;
      case 12: return <StepDuration />;
      case 13: return <StepSetupType />;
      case 14: return <StepTargetFrequency />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile Setup</Text>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepLine} />
          <Text style={styles.stepText}>
            STEP {currentStep.toString().padStart(2, "0")}
          </Text>
        </View>

        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.continueButton, !isValid && styles.continueButtonDisabled]} 
          onPress={handleContinue}
        >
          <Text style={[styles.continueText, !isValid && styles.continueTextDisabled]}>CONTINUE</Text>
          <ArrowRight size={20} color={isValid ? theme.background : theme.muted} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: theme.neon,
    borderRadius: 2,
  },
  stepText: {
    color: theme.neon,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  continueButton: {
    backgroundColor: theme.neon,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: theme.surfaceRaised,
  },
  continueText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  continueTextDisabled: {
    color: theme.muted,
  },
});
