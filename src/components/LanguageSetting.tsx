import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Check, Languages } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { AppText, ListRow } from "@/components/kit";
import { useLanguage } from "@/i18n";
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type LanguageSetting as Setting } from "@/i18n/languages";
import { colors, radius, spacing } from "@/lib/theme";
import { useLanguageStore } from "@/store/language-store";

/** Settings row that shows the current language and opens a small picker: Automatic, English, Français, Español. */
export function LanguageSetting() {
  const { t } = useTranslation("common");
  const language = useLanguage();
  const setting = useLanguageStore((s) => s.setting);
  const setSetting = useLanguageStore((s) => s.setSetting);
  const [open, setOpen] = useState(false);

  const options: { value: Setting; label: string; hint?: string }[] = [
    { value: "auto", label: t("language.auto"), hint: `${t("language.autoHint")} · ${LANGUAGE_NAMES[language]}` },
    ...SUPPORTED_LANGUAGES.map((l) => ({ value: l as Setting, label: LANGUAGE_NAMES[l] })),
  ];

  return (
    <>
      <ListRow
        icon={<Languages size={20} color={colors.accent} />}
        title={t("language.title")}
        subtitle={setting === "auto" ? t("language.auto") : LANGUAGE_NAMES[language]}
        onPress={() => setOpen(true)}
      />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel={t("language.close")}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <AppText variant="titleMedium">{t("language.choose")}</AppText>
            {options.map((option) => {
              const selected = setting === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    setSetting(option.value);
                    setOpen(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <AppText variant="titleSmall">{option.label}</AppText>
                    {option.hint ? (
                      <AppText variant="bodyMedium" color="textSecondary">
                        {option.hint}
                      </AppText>
                    ) : null}
                  </View>
                  {selected ? <Check size={20} color={colors.accent} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: spacing["2xl"] },
  sheet: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bgInset,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionSelected: { borderColor: colors.accent },
});
