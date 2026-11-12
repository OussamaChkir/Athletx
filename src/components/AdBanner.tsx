import { View, StyleSheet } from "react-native";
import { theme } from "@/lib/theme";

export function AdBanner() {
  return (
    <View style={styles.container}>
      {/* Ads removed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: theme.background,
    paddingBottom: 4,
  },
});
