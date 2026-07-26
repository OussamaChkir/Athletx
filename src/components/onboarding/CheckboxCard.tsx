import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";
import { LucideIcon, Check } from "lucide-react-native";

interface CheckboxCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CheckboxCard({ title, description, icon: Icon, selected, onToggle, disabled }: CheckboxCardProps) {
  return (
    <Pressable
      style={[
        styles.container, 
        selected && styles.containerSelected,
        disabled && !selected && styles.containerDisabled
      ]}
      onPress={disabled && !selected ? undefined : onToggle}
    >
      {Icon && (
        <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
          <Icon size={24} color={selected ? theme.background : theme.neon} />
        </View>
      )}
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, disabled && !selected && styles.textDisabled]}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <View style={[styles.checkbox, selected && styles.checkboxSelected, disabled && !selected && styles.checkboxDisabled]}>
        {selected && <Check size={16} color={theme.background} strokeWidth={4} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  containerSelected: {
    borderColor: theme.neon,
    backgroundColor: "rgba(8, 253, 142, 0.05)",
  },
  containerDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(8, 253, 142, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: theme.neon,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  textDisabled: {
    color: theme.muted,
  },
  description: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: theme.neon,
    borderColor: theme.neon,
  },
  checkboxDisabled: {
    borderColor: theme.border,
  },
});
