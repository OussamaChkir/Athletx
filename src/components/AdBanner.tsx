import { Platform, View, StyleSheet } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

// Use Google's Test IDs for development.
// Replace with your real ad unit IDs before releasing to production.
const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      android: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      ios: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
    }) ?? TestIds.ADAPTIVE_BANNER;

export function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#070b09",
    paddingBottom: 4,
  },
});
