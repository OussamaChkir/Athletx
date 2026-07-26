import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";
import { LucideIcon } from "lucide-react-native";

interface RadioCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}

export function RadioCard({ title, description, icon: Icon, selected, onSelect }: RadioCardProps) {
  return (
    <Pressable
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onSelect}
    >
      {Icon && (
        <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
          <Icon size={24} color={selected ? theme.background : theme.neon} />
        </View>
      )}
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
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
  description: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: theme.neon,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.neon,
  },
});
