import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { ExternalLink, Info, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { theme } from "@/lib/theme";
import { bmiFormula, healthDisclaimer, HEALTH_SOURCES } from "@/lib/health-sources";

/**
 * A "Sources & disclaimer" link that opens a sheet with the citations (tappable links) for the health
 * information shown in the app, the BMI formula and a medical disclaimer.
 */
export function HealthSourcesLink({ label }: { label?: string }) {
  const { t } = useTranslation("settings");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={s.link}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("health.linkA11y")}
      >
        <Info size={14} color={theme.neon} />
        <Text style={s.linkText}>{label ?? t("health.linkLabel")}</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={s.sheet} edges={["top", "bottom"]}>
          <View style={s.header}>
            <Text style={s.title}>{t("health.title")}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12} accessibilityLabel={t("health.close")}>
              <X size={22} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={s.body}>
            <Text style={s.sectionLabel}>{t("health.howBmi")}</Text>
            <Text style={s.text}>{bmiFormula()}</Text>
            <Text style={s.text}>{t("health.categories")}</Text>

            <Text style={[s.sectionLabel, { marginTop: 24 }]}>{t("health.sources")}</Text>
            {HEALTH_SOURCES.map((src) => {
              const title = t(`health.sourceList.${src.id}.title`);
              const publisher = t(`health.sourceList.${src.id}.publisher`);
              return (
                <Pressable
                  key={src.url}
                  style={s.sourceCard}
                  onPress={() => void WebBrowser.openBrowserAsync(src.url)}
                  accessibilityRole="link"
                  accessibilityLabel={`${title}, ${publisher}`}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.sourceTitle}>{title}</Text>
                    <Text style={s.sourcePublisher}>{publisher}</Text>
                    <Text style={s.sourceCovers}>{t(`health.sourceList.${src.id}.covers`)}</Text>
                    <Text style={s.sourceUrl} numberOfLines={2}>
                      {src.url}
                    </Text>
                  </View>
                  <ExternalLink size={18} color={theme.neon} />
                </Pressable>
              );
            })}

            <Text style={[s.sectionLabel, { marginTop: 24 }]}>{t("health.disclaimerTitle")}</Text>
            <Text style={s.text}>{healthDisclaimer()}</Text>
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
