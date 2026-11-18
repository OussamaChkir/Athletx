import { HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, frame, monospacedDigit, padding } from "@expo/ui/swift-ui/modifiers";
import { createLiveActivity } from "expo-widgets";

/** Everything the lock-screen card shows. Times are epoch milliseconds so they survive being sent to the widget runtime. */
export type WorkoutActivityProps = {
  /** "Push Day" */
  workoutName: string;
  /** Current lift (during a set) or the next lift (during rest). */
  exerciseTitle: string;
  /** Already translated by the app, e.g. "Set 1 of 4 · 10 reps". The widget runtime has no i18n. */
  detail: string;
  /** Already translated header text, e.g. "ATHLETX" or "ATHLETX · REST". */
  header: string;
  phase: "exercise" | "rest";
  /** When the workout started; drives the count-up clock shown while lifting. */
  startedAt: number;
  /** When the rest countdown reaches zero (rest phase only). */
  restEndsAt: number;
  /** When this update was sent; the countdown's visual start. */
  updatedAt: number;
};

/**
 * Lock Screen card and Dynamic Island for a workout in progress.
 *
 * The layout runs in the widget extension, not in the app, so the clock is a native SwiftUI timer:
 * it keeps counting with the screen off and the app suspended.
 */
const WorkoutActivity = (props: WorkoutActivityProps) => {
  "widget";
  const lime = "#d5ff5f";
  const resting = props.phase === "rest";

  const clock = resting ? (
    <Text
      timerInterval={{ lower: new Date(props.updatedAt), upper: new Date(props.restEndsAt) }}
      countsDown
      modifiers={[font({ size: 22, weight: "bold" }), foregroundStyle(lime), monospacedDigit()]}
    />
  ) : (
    <Text
      timerInterval={{ lower: new Date(props.startedAt), upper: new Date(props.startedAt + 24 * 60 * 60 * 1000) }}
      countsDown={false}
      modifiers={[font({ size: 22, weight: "bold" }), foregroundStyle("#ffffff"), monospacedDigit()]}
    />
  );

  const compactClock = resting ? (
    <Text
      timerInterval={{ lower: new Date(props.updatedAt), upper: new Date(props.restEndsAt) }}
      countsDown
      modifiers={[font({ size: 14, weight: "semibold" }), foregroundStyle(lime), monospacedDigit(), frame({ width: 44 })]}
    />
  ) : (
    <Text
      timerInterval={{ lower: new Date(props.startedAt), upper: new Date(props.startedAt + 24 * 60 * 60 * 1000) }}
      countsDown={false}
      modifiers={[font({ size: 14, weight: "semibold" }), foregroundStyle("#ffffff"), monospacedDigit(), frame({ width: 44 })]}
    />
  );

  return {
    banner: (
      <VStack alignment="leading" spacing={12} modifiers={[padding({ all: 16 })]}>
        <HStack>
          <Text modifiers={[font({ size: 13, weight: "heavy" }), foregroundStyle(lime)]}>
            {props.header}
          </Text>
          <Spacer />
          {clock}
        </HStack>
        <HStack spacing={12}>
          <Image systemName="dumbbell.fill" size={26} color={lime} modifiers={[frame({ width: 48, height: 48 })]} />
          <VStack alignment="leading" spacing={2}>
            <Text modifiers={[font({ size: 20, weight: "semibold" }), foregroundStyle("#ffffff")]}>
              {props.exerciseTitle}
            </Text>
            <Text modifiers={[font({ size: 16 }), foregroundStyle("#b4b4ba")]}>{props.detail}</Text>
          </VStack>
          <Spacer />
        </HStack>
      </VStack>
    ),
    compactLeading: <Image systemName="dumbbell.fill" color={lime} />,
    compactTrailing: compactClock,
    minimal: <Image systemName="dumbbell.fill" color={lime} />,
    expandedLeading: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Image systemName="dumbbell.fill" size={24} color={lime} />
      </VStack>
    ),
    expandedTrailing: <VStack modifiers={[padding({ all: 12 })]}>{clock}</VStack>,
    expandedBottom: (
      <VStack alignment="leading" modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ size: 17, weight: "semibold" })]}>{props.exerciseTitle}</Text>
        <Text modifiers={[font({ size: 14 }), foregroundStyle("#b4b4ba")]}>{props.detail}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity("WorkoutActivity", WorkoutActivity);
