import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/kit";
import { colors, spacing } from "@/lib/theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useWorkoutStore } from "@/store/workout-store";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";

// Step placeholders
import StepGender from "./steps/StepGender";
import StepExperience from "./steps/StepExperience";
import StepFrequency from "./steps/StepFrequency";
import StepGoal from "./steps/StepGoal";
import StepLocation from "./steps/StepLocation";
import StepInjuries from "./steps/StepInjuries";
import StepFocus from "./steps/StepFocus";
import StepAge from "./steps/StepAge";
import StepHeight from "./steps/StepHeight";
import StepWeight from "./steps/StepWeight";
import StepGoalWeight from "./steps/StepGoalWeight";
import StepDuration from "./steps/StepDuration";
import StepSetupType from "./steps/StepSetupType";
import StepTargetFrequency from "./steps/StepTargetFrequency";

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
      case 13: return store.targetFrequency !== null;
      case 14: return store.setupType !== null;
      default: return true;
    }
  };

  const isValid = isStepValid();

  const handleContinue = () => {
    if (!isValid) return;
    if (currentStep === TOTAL_STEPS) {
      // Mark onboarding as complete
      store.completeOnboarding();

      // If "smart" plan chosen, auto-generate a workout from onboarding data
      if (store.setupType === "smart") {
        const workoutStore = useWorkoutStore.getState();
        workoutStore.generateFromOnboarding(store);
      }

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
      case 13: return <StepTargetFrequency />;
      case 14: return <StepSetupType />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OnboardingHeader step={currentStep} total={TOTAL_STEPS} onBack={handleBack} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue" disabled={!isValid} onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bgApp },
  content: { flex: 1 },
  // flexGrow lets steps with a centered picker use the full height.
  contentContainer: { flexGrow: 1, paddingHorizontal: spacing["2xl"], paddingBottom: spacing["2xl"] },
  footer: { paddingHorizontal: spacing["2xl"], paddingTop: spacing.md, paddingBottom: spacing.lg },
});
