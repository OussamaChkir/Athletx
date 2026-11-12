import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { Tabs } from "expo-router";
import { colors, radius, spacing } from "@/lib/theme";
import { AppText } from "./AppText";

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/** Height of the floating bar; screens add this (plus the bottom inset) to their bottom padding. */
export const TAB_BAR_HEIGHT = 72;

/** Tab Bar from Figma: floating dark pill, the active tab is a lime pill with icon and label. */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = typeof options.title === "string" ? options.title : route.name;
          const focused = state.index === index;
          const iconColor = focused ? colors.textOnAccent : colors.textSecondary;

          const onPress = () => {
            const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: "tabLongPress", target: route.key })}
              style={[styles.item, focused && styles.itemActive]}
            >
              {options.tabBarIcon?.({ focused, color: iconColor, size: 20 })}
              {focused ? (
                <AppText variant="labelMedium" color="textOnAccent" numberOfLines={1}>
                  {label}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
  },
  bar: {
    height: TAB_BAR_HEIGHT - spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.full,
    padding: spacing.sm,
  },
  item: {
    height: 44,
    minWidth: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  itemActive: { backgroundColor: colors.accent },
});
