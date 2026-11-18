import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { PenTool, Sparkles } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

export default function StepSetupType() {
  const { t } = useTranslation("onboarding");
  const { setupType, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title={t("setupType.title")}
        highlight={t("setupType.highlight")}
        subtitle={t("setupType.subtitle")}
      />
      <SelectList>
        <SelectRow
          title={t("setupType.smart.title")}
          description={t("setupType.smart.description")}
          icon={Sparkles}
          selected={setupType === "smart"}
          onPress={() => setField("setupType", "smart")}
        />
        <SelectRow
          title={t("setupType.custom.title")}
          description={t("setupType.custom.description")}
          icon={PenTool}
          selected={setupType === "custom"}
          onPress={() => setField("setupType", "custom")}
        />
      </SelectList>
    </View>
  );
}
