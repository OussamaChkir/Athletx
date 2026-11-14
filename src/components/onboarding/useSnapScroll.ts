import { useRef, type ComponentRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";

type Options = {
  /** Number of snap positions. */
  count: number;
  /** Distance between two snap positions, in px. */
  itemWidth: number;
  initialIndex: number;
  /** Called while scrolling, each time the centered position changes. */
  onIndexChange: (index: number) => void;
  /** Called once the scroll has come to rest on a position. */
  onSettle: (index: number) => void;
};

/**
 * Shared behavior of the horizontal pickers: snap to positions, report the centered index while
 * scrolling (with a light haptic tick) and again when it comes to rest.
 */
export function useSnapScroll({ count, itemWidth, initialIndex, onIndexChange, onSettle }: Options) {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const current = useRef(initialIndex);
  const placed = useRef(false);

  const toIndex = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    Math.min(count - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.x / itemWidth)));

  const scrollProps = {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    snapToInterval: itemWidth,
    decelerationRate: "fast" as const,
    scrollEventThrottle: 16,
    // Put the starting value under the marker once, as soon as the content has a size.
    onContentSizeChange: () => {
      if (placed.current) return;
      placed.current = true;
      ref.current?.scrollTo({ x: initialIndex * itemWidth, animated: false });
    },
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = toIndex(e);
      if (i === current.current) return;
      current.current = i;
      onIndexChange(i);
      Haptics.selectionAsync().catch(() => undefined);
    },
    onMomentumScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => onSettle(toIndex(e)),
    // A release exactly on a snap position starts no deceleration, so settle here too.
    onScrollEndDrag: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (Math.abs(e.nativeEvent.velocity?.x ?? 0) < 0.05) onSettle(toIndex(e));
    },
  };

  const scrollToIndex = (index: number) => ref.current?.scrollTo({ x: index * itemWidth, animated: true });

  return { ref, scrollProps, scrollToIndex };
}
