import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus, Trash2 } from "lucide-react-native";
import { format } from "date-fns";
import { router } from "expo-router";
import { theme } from "@/lib/theme";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useWeightStore, type WeighIn } from "@/store/weight-store";
import {
  formatWeight,
  fromKg,
  parseDateKey,
  unitLabel,
} from "@/lib/weight";
import { LogWeightModal } from "@/components/body-weight-card";

export default function WeighInsScreen() {
  const entries = useWeightStore((s) => s.entries);
  const deleteEntry = useWeightStore((s) => s.deleteEntry);
  const unit = unitLabel(useOnboardingStore((s) => s.weight.unit));
  const [logOpen, setLogOpen] = useState(false);
  const [editing, setEditing] = useState<WeighIn | null>(null);

  const data = [...entries].reverse();

  const confirmDelete = (entry: WeighIn) => {
    Alert.alert("Delete weigh-in", "Remove this day’s log?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteEntry(entry.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
          <ArrowLeft size={22} color={theme.text} />
        </Pressable>
        <Text style={styles.title}>All weigh-ins</Text>
        <Pressable
          onPress={() => {
            setEditing(null);
            setLogOpen(true);
          }}
          style={styles.iconBtn}
          hitSlop={8}
        >
          <Plus size={22} color={theme.neon} />
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No weigh-ins yet. Tap + to log one.</Text>
        }
        renderItem={({ item, index }) => {
          const display = fromKg(item.kg, unit);
          const older = data[index + 1];
          const delta =
            older != null ? display - fromKg(older.kg, unit) : null;
          return (
            <Pressable
              style={styles.row}
              onPress={() => {
                setEditing(item);
                setLogOpen(true);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowDate}>
                  {format(parseDateKey(item.date), "EEE d MMM yyyy")}
                </Text>
                <Text style={styles.rowWeight}>
                  {formatWeight(display, 1)}{" "}
                  <Text style={styles.rowUnit}>{unit}</Text>
                </Text>
              </View>
              {delta != null && Math.abs(delta) >= 0.05 ? (
                <Text
                  style={[
                    styles.rowDelta,
                    { color: delta < 0 ? theme.neon : theme.ember },
                  ]}
                >
                  {delta > 0 ? "+" : ""}
                  {formatWeight(delta, 1)}
                </Text>
              ) : (
                <Text style={[styles.rowDelta, { color: theme.muted }]}>—</Text>
              )}
              <Pressable
                onPress={() => confirmDelete(item)}
                hitSlop={10}
                style={styles.trash}
              >
                <Trash2 size={16} color={theme.muted} />
              </Pressable>
            </Pressable>
          );
        }}
      />

      <LogWeightModal
        visible={logOpen}
        onClose={() => {
          setLogOpen(false);
          setEditing(null);
        }}
        initialDate={editing?.date}
        initialKg={editing?.kg ?? entries[entries.length - 1]?.kg}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
  },
  list: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  empty: {
    color: theme.muted,
    textAlign: "center",
    marginTop: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  rowDate: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  rowWeight: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "800",
  },
  rowUnit: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  rowDelta: {
    fontSize: 14,
    fontWeight: "800",
    minWidth: 48,
    textAlign: "right",
  },
  trash: {
    padding: 6,
  },
});
