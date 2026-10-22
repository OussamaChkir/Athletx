import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { ExternalLink, Info, X } from "lucide-react-native";
import { theme } from "@/lib/theme";
import { BMI_FORMULA, HEALTH_DISCLAIMER, HEALTH_SOURCES } from "@/lib/health-sources";

/**
 * A "Sources & disclaimer" link that opens a sheet with the citations (tappable links) for the health
 * information shown in the app, the BMI formula and a medical disclaimer.
 */
export function HealthSourcesLink({ label = "Sources & disclaimer" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={s.link}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Health information sources and disclaimer"
      >
        <Info size={14} color={theme.neon} />
        <Text style={s.linkText}>{label}</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={s.sheet} edges={["top", "bottom"]}>
          <View style={s.header}>
            <Text style={s.title}>Sources & disclaimer</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12} accessibilityLabel="Close">
              <X size={22} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={s.body}>
            <Text style={s.sectionLabel}>HOW BMI IS CALCULATED</Text>
            <Text style={s.text}>{BMI_FORMULA}</Text>
            <Text style={s.text}>
              Categories follow the standard adult ranges published by the WHO and the CDC: below 18.5
              underweight, 18.5 to 24.9 healthy weight, 25 to 29.9 overweight, 30 and above obesity.
            </Text>

            <Text style={[s.sectionLabel, { marginTop: 24 }]}>SOURCES</Text>
            {HEALTH_SOURCES.map((src) => (
              <Pressable
                key={src.url}
                style={s.sourceCard}
                onPress={() => void WebBrowser.openBrowserAsync(src.url)}
                accessibilityRole="link"
                accessibilityLabel={`${src.title}, ${src.publisher}`}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.sourceTitle}>{src.title}</Text>
                  <Text style={s.sourcePublisher}>{src.publisher}</Text>
                  <Text style={s.sourceCovers}>{src.covers}</Text>
                  <Text style={s.sourceUrl} numberOfLines={2}>
                    {src.url}
                  </Text>
                </View>
                <ExternalLink size={18} color={theme.neon} />
              </Pressable>
            ))}

            <Text style={[s.sectionLabel, { marginTop: 24 }]}>DISCLAIMER</Text>
            <Text style={s.text}>{HEALTH_DISCLAIMER}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  linkText: {
    color: theme.neon,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  sheet: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: { color: theme.text, fontSize: 20, fontWeight: "900" },
  body: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  text: { color: theme.text, fontSize: 14, lineHeight: 21, marginBottom: 10 },
  sourceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  sourceTitle: { color: theme.text, fontSize: 15, fontWeight: "800" },
  sourcePublisher: { color: theme.neon, fontSize: 12, fontWeight: "700", marginTop: 2 },
  sourceCovers: { color: theme.muted, fontSize: 13, lineHeight: 18, marginTop: 6 },
  sourceUrl: { color: theme.muted, fontSize: 11, marginTop: 6 },
});
