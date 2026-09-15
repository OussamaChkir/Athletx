import { useState, useCallback } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  AtSign,
  Camera,
  CheckCircle,
  ChevronDown,
  Copy,
  Edit2,
  Hash,
  Info,
  Shield,
  Target,
  User,
  X,
  Ruler,
  Weight,
  Calendar,
  Dumbbell,
  Flame,
  MapPin,
  AlertTriangle,
  Zap,
  Clock,
  RefreshCw,
} from "lucide-react-native";
import { router } from "expo-router";
import { theme } from "@/lib/theme";
import { useProfileStore } from "@/store/profile-store";
import {
  useOnboardingStore,
  type Gender,
  type Experience,
  type Goal,
  type FrequencyStr,
  type DurationType,
  type LocationType,
} from "@/store/onboarding-store";

/* ─────────────────────────────────────────────
   OPTION DATA
───────────────────────────────────────────── */
const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const EXPERIENCE_OPTIONS: { label: string; value: Experience }[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const GOAL_OPTIONS: { label: string; value: Goal }[] = [
  { label: "Lose Weight", value: "lose_weight" },
  { label: "Build Muscle", value: "build_muscle" },
  { label: "Get Stronger", value: "get_stronger" },
  { label: "Maintain", value: "maintain" },
];

const FREQUENCY_OPTIONS: { label: string; value: FrequencyStr }[] = [
  { label: "0 – 1 days/week", value: "0-1" },
  { label: "2 – 3 days/week", value: "2-3" },
  { label: "4 – 5 days/week", value: "4-5" },
  { label: "6+ days/week", value: "6+" },
];

const DURATION_OPTIONS: { label: string; value: DurationType }[] = [
  { label: "Quick (<20 min)", value: "quick" },
  { label: "20 – 40 min", value: "20-40" },
  { label: "40 – 60 min", value: "40-60" },
  { label: "60+ min", value: "60+" },
];

const LOCATION_OPTIONS: { label: string; value: LocationType }[] = [
  { label: "Large Gym", value: "large_gym" },
  { label: "Small Gym", value: "small_gym" },
  { label: "Home", value: "home" },
  { label: "Bodyweight Only", value: "bodyweight" },
];

const FOCUS_OPTIONS = [
  "chest", "back", "shoulders", "arms", "core", "legs", "glutes", "full body",
];

const INJURY_OPTIONS = [
  "Lower Back", "Knee", "Shoulder", "Wrist", "Ankle", "Neck", "Hip", "Elbow",
];

/* ─────────────────────────────────────────────
   REUSABLE HELPER COMPONENTS
───────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  return <Text style={s.sectionLabel}>{text}</Text>;
}

function FieldCard({ children }: { children: React.ReactNode }) {
  return <View style={s.fieldCard}>{children}</View>;
}

function Divider() {
  return <View style={s.divider} />;
}

/* Read-only row with optional copy */
function ReadonlyField({
  icon: Icon,
  label,
  value,
  onCopy,
}: {
  icon: any;
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <View style={s.readonlyRow}>
      <View style={s.fieldIconWrap}>
        <Icon size={17} color={theme.neon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.fieldLabel}>{label}</Text>
        <Text style={s.readonlyValue} numberOfLines={1}>{value}</Text>
      </View>
      {onCopy && (
        <Pressable onPress={() => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={s.copyBtn}>
          {copied ? <CheckCircle size={16} color={theme.neon} /> : <Copy size={16} color={theme.muted} />}
        </Pressable>
      )}
    </View>
  );
}

/* Text input row */
function EditField({
  icon: Icon,
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
  suffix,
  multiline,
  maxLength,
  keyboardType,
}: {
  icon: any;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: "default" | "numeric" | "decimal-pad";
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.editRow, focused && s.editRowFocused]}>
      <View style={s.fieldIconWrap}>
        <Icon size={17} color={focused ? theme.neon : theme.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.fieldLabel}>{label}</Text>
        <View style={s.inputRow}>
          {prefix && <Text style={s.inputPrefix}>{prefix}</Text>}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.muted}
            style={[s.textInput, multiline && s.textInputMulti]}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline={multiline}
            maxLength={maxLength}
            keyboardType={keyboardType ?? "default"}
            autoCapitalize={prefix === "@" ? "none" : "sentences"}
            autoCorrect={!prefix}
          />
          {suffix && <Text style={s.inputSuffix}>{suffix}</Text>}
        </View>
        {maxLength && (
          <Text style={s.charCount}>{value.length}/{maxLength}</Text>
        )}
      </View>
    </View>
  );
}

/* Single-select option row (radio-style) */
function OptionPicker<T extends string | null>({
  icon: Icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <Pressable style={[s.editRow, open && s.editRowFocused]} onPress={() => setOpen((p) => !p)}>
        <View style={s.fieldIconWrap}>
          <Icon size={17} color={open ? theme.neon : theme.muted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.fieldLabel}>{label}</Text>
          <Text style={selected ? s.pickerValue : s.pickerPlaceholder}>
            {selected?.label ?? "Tap to select"}
          </Text>
        </View>
        <ChevronDown size={18} color={theme.muted}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>
      {open && (
        <View style={s.dropdown}>
          {options.map((opt) => (
            <Pressable
              key={String(opt.value)}
              style={[s.dropdownOption, opt.value === value && s.dropdownOptionActive]}
              onPress={() => { onChange(opt.value); setOpen(false); }}
            >
              <Text style={[s.dropdownOptionText, opt.value === value && s.dropdownOptionTextActive]}>
                {opt.label}
              </Text>
              {opt.value === value && <CheckCircle size={15} color={theme.neon} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/* Multi-select chip row (toggle chips) */
function ChipMultiSelect<T extends string>({
  icon: Icon,
  label,
  options,
  values,
  onChange,
}: {
  icon: any;
  label: string;
  options: { label: string; value: T }[];
  values: T[];
  onChange: (v: T[]) => void;
}) {
  const toggle = (v: T) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };
  return (
    <View style={s.chipRow}>
      <View style={s.chipRowHeader}>
        <View style={s.fieldIconWrap}>
          <Icon size={17} color={theme.muted} />
        </View>
        <Text style={[s.fieldLabel, { flex: 1, marginBottom: 0 }]}>{label}</Text>
      </View>
      <View style={s.chipGrid}>
        {options.map((opt) => {
          const active = values.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              style={[s.chip, active && s.chipActive]}
              onPress={() => toggle(opt.value)}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* Unit toggle (kg/lb or cm/ft) */
function UnitToggle({
  unit,
  options,
  onChange,
}: {
  unit: string;
  options: string[];
  onChange: (u: string) => void;
}) {
  return (
    <View style={s.unitToggle}>
      {options.map((u) => (
        <Pressable
          key={u}
          style={[s.unitBtn, u === unit && s.unitBtnActive]}
          onPress={() => onChange(u)}
        >
          <Text style={[s.unitBtnText, u === unit && s.unitBtnTextActive]}>{u}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* Avatar circle */
function AvatarCircle({ name, size = 90 }: { name: string; size?: number }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[s.avatarInitials, { fontSize: size * 0.34 }]}>{initials || "?"}</Text>
      <View style={s.cameraOverlay}>
        <Camera size={16} color={theme.background} />
      </View>
    </View>
  );
}

/* Google connect block */
function GoogleConnectSection({
  email, isConnecting, onConnect, onDisconnect,
}: { email: string | null; isConnecting: boolean; onConnect: () => void; onDisconnect: () => void; }) {
  return (
    <View style={s.googleCard}>
      <View style={s.googleLogoWrap}>
        <Text style={s.googleLogo}>G</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.googleTitle}>{email ? "Google Connected" : "Connect with Google"}</Text>
        <Text style={s.googleSub}>{email ?? "Sync your account & enable Google sign‑in"}</Text>
      </View>
      {email ? (
        <Pressable style={s.googleDisconnectBtn} onPress={onDisconnect}>
          <X size={15} color={theme.danger} />
        </Pressable>
      ) : (
        <Pressable style={[s.googleConnectBtn, isConnecting && { opacity: 0.6 }]} onPress={onConnect} disabled={isConnecting}>
          {isConnecting
            ? <ActivityIndicator size="small" color={theme.background} />
            : <Text style={s.googleConnectText}>Connect</Text>
          }
        </Pressable>
      )}
    </View>
  );
}

/* ─────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────── */
export default function EditProfileScreen() {
  const profile = useProfileStore();
  const ob = useOnboardingStore();

  /* ── Profile draft ── */
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [saving, setSaving] = useState(false);

  /* ── Body metrics draft ── */
  const [age, setAge] = useState(ob.age !== null ? String(ob.age) : "");
  const [heightVal, setHeightVal] = useState(ob.height.value !== null ? String(ob.height.value) : "");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">(ob.height.unit);
  const [weightVal, setWeightVal] = useState(ob.weight.value !== null ? String(ob.weight.value) : "");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">(ob.weight.unit);
  const [goalWeight, setGoalWeight] = useState(ob.goalWeight !== null ? String(ob.goalWeight) : "");

  /* ── Training prefs draft ── */
  const [gender, setGender] = useState<Gender>(ob.gender);
  const [experience, setExperience] = useState<Experience>(ob.experience);
  const [goal, setGoal] = useState<Goal>(ob.goal);
  const [currentFrequency, setCurrentFrequency] = useState<FrequencyStr>(ob.currentFrequency);
  const [duration, setDuration] = useState<DurationType>(ob.duration);
  const [targetFrequency, setTargetFrequency] = useState(
    ob.targetFrequency !== null ? String(ob.targetFrequency) : ""
  );
  const [location, setLocation] = useState<LocationType[]>(ob.location);
  const [focusArea, setFocusArea] = useState<string[]>(ob.focusArea);
  const [injuries, setInjuries] = useState<string[]>(ob.injuries);

  /* ── Dirty check ── */
  const isDirty =
    displayName !== profile.displayName ||
    username !== profile.username ||
    bio !== profile.bio ||
    age !== (ob.age !== null ? String(ob.age) : "") ||
    heightVal !== (ob.height.value !== null ? String(ob.height.value) : "") ||
    heightUnit !== ob.height.unit ||
    weightVal !== (ob.weight.value !== null ? String(ob.weight.value) : "") ||
    weightUnit !== ob.weight.unit ||
    goalWeight !== (ob.goalWeight !== null ? String(ob.goalWeight) : "") ||
    gender !== ob.gender ||
    experience !== ob.experience ||
    goal !== ob.goal ||
    currentFrequency !== ob.currentFrequency ||
    duration !== ob.duration ||
    targetFrequency !== (ob.targetFrequency !== null ? String(ob.targetFrequency) : "") ||
    JSON.stringify(location) !== JSON.stringify(ob.location) ||
    JSON.stringify(focusArea) !== JSON.stringify(ob.focusArea) ||
    JSON.stringify(injuries) !== JSON.stringify(ob.injuries);

  /* ── Save ── */
  const handleSave = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert("Name required", "Please enter your display name.");
      return;
    }
    if (username.trim().length < 3) {
      Alert.alert("Username too short", "Username must be at least 3 characters.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    // Persist profile fields
    profile.updateProfile({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase().replace(/\s+/g, "_"),
      bio: bio.trim(),
    });

    // Persist onboarding / body / training fields
    ob.setField("age", age ? Number(age) : null);
    ob.setField("height", { value: heightVal ? Number(heightVal) : null, unit: heightUnit });
    ob.setField("weight", { value: weightVal ? Number(weightVal) : null, unit: weightUnit });
    ob.setField("goalWeight", goalWeight ? Number(goalWeight) : null);
    ob.setField("gender", gender);
    ob.setField("experience", experience);
    ob.setField("goal", goal);
    ob.setField("currentFrequency", currentFrequency);
    ob.setField("duration", duration);
    ob.setField("targetFrequency", targetFrequency ? Number(targetFrequency) : null);
    ob.setField("location", location);
    ob.setField("focusArea", focusArea);
    ob.setField("injuries", injuries);

    setSaving(false);
    Alert.alert("Saved!", "Your profile has been updated.");
  }, [
    displayName, username, bio,
    age, heightVal, heightUnit, weightVal, weightUnit, goalWeight,
    gender, experience, goal, currentFrequency, duration, targetFrequency,
    location, focusArea, injuries,
    profile, ob,
  ]);

  /* ── Google ── */
  const handleGoogleConnect = useCallback(() => {
    profile.setConnectingGoogle(true);
    setTimeout(() => {
      profile.connectGoogle("user@gmail.com");
      Alert.alert("Connected!", "Your Google account has been linked.");
    }, 1800);
  }, [profile]);

  const handleGoogleDisconnect = useCallback(() => {
    Alert.alert("Disconnect Google?", "You won't be able to sign in with Google after this.", [
      { text: "Cancel", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: () => profile.disconnectGoogle() },
    ]);
  }, [profile]);

  const shortId = profile.userId.slice(0, 8).toUpperCase();

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable style={s.headerBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>EDIT PROFILE</Text>
        <Pressable
          style={[s.saveBtn, (!isDirty || saving) && s.saveBtnDim]}
          onPress={handleSave}
          disabled={!isDirty || saving}
        >
          {saving
            ? <ActivityIndicator size="small" color={theme.background} />
            : <Text style={s.saveBtnText}>Save</Text>
          }
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar ── */}
        <View style={s.avatarSection}>
          <AvatarCircle name={displayName || username} size={92} />
          <Text style={s.avatarHint}>Tap to change photo</Text>
        </View>

        {/* ══════════════════════════════════
            SECTION: ACCOUNT IDENTITY
        ══════════════════════════════════ */}
        <SectionLabel text="ACCOUNT IDENTITY" />
        <FieldCard>
          <ReadonlyField
            icon={Hash}
            label="User ID"
            value={shortId}
            onCopy={() => {/* Clipboard.setStringAsync(profile.userId) */}}
          />
          <Divider />
          <ReadonlyField icon={Shield} label="Full UUID" value={profile.userId} onCopy={() => {}} />
        </FieldCard>

        {/* ══════════════════════════════════
            SECTION: PERSONAL INFO
        ══════════════════════════════════ */}
        <SectionLabel text="PERSONAL INFO" />
        <FieldCard>
          <EditField
            icon={User}
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your full name"
            maxLength={40}
          />
          <Divider />
          <EditField
            icon={AtSign}
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="yourhandle"
            prefix="@"
            maxLength={20}
          />
          <Divider />
          <EditField
            icon={Edit2}
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about your fitness journey…"
            multiline
            maxLength={120}
          />
        </FieldCard>

        {/* ══════════════════════════════════
            SECTION: BODY METRICS
        ══════════════════════════════════ */}
        <SectionLabel text="BODY METRICS" />
        <FieldCard>
          {/* Age */}
          <EditField
            icon={Calendar}
            label="Age"
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 25"
            keyboardType="numeric"
            suffix="yrs"
          />
          <Divider />

          {/* Height */}
          <View style={s.editRow}>
            <View style={s.fieldIconWrap}>
              <Ruler size={17} color={theme.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Height</Text>
              <View style={s.inputRow}>
                <TextInput
                  value={heightVal}
                  onChangeText={setHeightVal}
                  placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 5.9"}
                  placeholderTextColor={theme.muted}
                  style={[s.textInput, { marginRight: 8 }]}
                  keyboardType="decimal-pad"
                />
                <Text style={s.inputSuffix}>{heightUnit}</Text>
              </View>
            </View>
            <UnitToggle unit={heightUnit} options={["cm", "ft"]} onChange={(u) => setHeightUnit(u as "cm" | "ft")} />
          </View>
          <Divider />

          {/* Weight */}
          <View style={s.editRow}>
            <View style={s.fieldIconWrap}>
              <Weight size={17} color={theme.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Current Weight</Text>
              <View style={s.inputRow}>
                <TextInput
                  value={weightVal}
                  onChangeText={setWeightVal}
                  placeholder={weightUnit === "kg" ? "e.g. 75" : "e.g. 165"}
                  placeholderTextColor={theme.muted}
                  style={[s.textInput, { marginRight: 8 }]}
                  keyboardType="decimal-pad"
                />
                <Text style={s.inputSuffix}>{weightUnit}</Text>
              </View>
            </View>
            <UnitToggle unit={weightUnit} options={["kg", "lb"]} onChange={(u) => setWeightUnit(u as "kg" | "lb")} />
          </View>
          <Divider />

          {/* Goal Weight */}
          <EditField
            icon={Target}
            label="Goal Weight"
            value={goalWeight}
            onChangeText={setGoalWeight}
            placeholder={`e.g. ${weightUnit === "kg" ? "70" : "155"}`}
            keyboardType="decimal-pad"
            suffix={weightUnit}
          />
        </FieldCard>

        {/* ══════════════════════════════════
            SECTION: TRAINING PROFILE
        ══════════════════════════════════ */}
        <SectionLabel text="TRAINING PROFILE" />
        <FieldCard>
          <OptionPicker
            icon={User}
            label="Gender"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
          <Divider />
          <OptionPicker
            icon={Zap}
            label="Experience Level"
            options={EXPERIENCE_OPTIONS}
            value={experience}
            onChange={setExperience}
          />
          <Divider />
          <OptionPicker
            icon={Flame}
            label="Primary Goal"
            options={GOAL_OPTIONS}
            value={goal}
            onChange={setGoal}
          />
          <Divider />
          <OptionPicker
            icon={RefreshCw}
            label="Current Frequency"
            options={FREQUENCY_OPTIONS}
            value={currentFrequency}
            onChange={setCurrentFrequency}
          />
          <Divider />
          <EditField
            icon={Target}
            label="Target Days / Week"
            value={targetFrequency}
            onChangeText={setTargetFrequency}
            placeholder="e.g. 4"
            keyboardType="numeric"
            suffix="days"
          />
          <Divider />
          <OptionPicker
            icon={Clock}
            label="Session Duration"
            options={DURATION_OPTIONS}
            value={duration}
            onChange={setDuration}
          />
        </FieldCard>

        {/* ══════════════════════════════════
            SECTION: GYM & EQUIPMENT
        ══════════════════════════════════ */}
        <SectionLabel text="GYM & EQUIPMENT" />
        <FieldCard>
          <ChipMultiSelect<LocationType>
            icon={MapPin}
            label="Training Location"
            options={LOCATION_OPTIONS}
            values={location}
            onChange={setLocation}
          />
        </FieldCard>

        {/* ══════════════════════════════════
            SECTION: FOCUS AREAS
        ══════════════════════════════════ */}
        <SectionLabel text="FOCUS AREAS" />
        <FieldCard>
          <ChipMultiSelect<string>
            icon={Dumbbell}
            label="Muscle Groups"
            options={FOCUS_OPTIONS.map((f) => ({ label: f[0].toUpperCase() + f.slice(1), value: f }))}
            values={focusArea}
            onChange={setFocusArea}
          />
        </FieldCard>

        {/* ══════════════════════════════════
            SECTION: INJURIES / LIMITATIONS
        ══════════════════════════════════ */}
        <SectionLabel text="INJURIES & LIMITATIONS" />
        <FieldCard>
          <ChipMultiSelect<string>
            icon={AlertTriangle}
            label="Affected Areas"
            options={INJURY_OPTIONS.map((i) => ({ label: i, value: i }))}
            values={injuries}
            onChange={setInjuries}
          />
        </FieldCard>

        {/* ══════════════════════════════════
            SECTION: CONNECTED ACCOUNTS
        ══════════════════════════════════ */}
        <SectionLabel text="CONNECTED ACCOUNTS" />
        <GoogleConnectSection
          email={profile.googleEmail}
          isConnecting={profile.isConnectingGoogle}
          onConnect={handleGoogleConnect}
          onDisconnect={handleGoogleDisconnect}
        />

        {/* ── Info notice ── */}
        <View style={s.notice}>
          <Info size={14} color={theme.muted} />
          <Text style={s.noticeText}>
            Your User ID is permanent and cannot be changed. All other profile and training
            data can be edited at any time.
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    color: theme.text, fontSize: 14, fontWeight: "900", letterSpacing: 3,
  },
  saveBtn: {
    backgroundColor: theme.neon, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 9,
    minWidth: 68, alignItems: "center", justifyContent: "center",
  },
  saveBtnDim: { opacity: 0.35 },
  saveBtnText: { color: theme.background, fontWeight: "900", fontSize: 14 },

  /* Scroll */
  scroll: { padding: 20, gap: 10, paddingBottom: 20 },

  /* Avatar */
  avatarSection: { alignItems: "center", paddingVertical: 20, gap: 10 },
  avatar: {
    backgroundColor: "#1a3d28",
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: theme.neon,
    shadowColor: theme.neon, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45, shadowRadius: 20, elevation: 10,
  },
  avatarInitials: { color: theme.neon, fontWeight: "900", letterSpacing: 2 },
  cameraOverlay: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.neon,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: theme.background,
  },
  avatarHint: { color: theme.muted, fontSize: 12, fontWeight: "500" },

  /* Section labels */
  sectionLabel: {
    color: theme.muted, fontSize: 11, fontWeight: "800",
    letterSpacing: 2, marginTop: 14, marginBottom: 6, paddingHorizontal: 2,
  },

  /* Field card */
  fieldCard: {
    backgroundColor: theme.surface,
    borderRadius: 18, borderWidth: 1,
    borderColor: theme.border, overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)", marginHorizontal: 16 },

  /* Readonly */
  readonlyRow: {
    flexDirection: "row", alignItems: "center", padding: 16, gap: 12,
  },
  fieldIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(8,253,142,0.08)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  fieldLabel: {
    color: theme.muted, fontSize: 11, fontWeight: "700",
    letterSpacing: 0.5, marginBottom: 3, textTransform: "uppercase",
  },
  readonlyValue: {
    color: theme.text, fontSize: 14, fontWeight: "600", fontFamily: "monospace",
  },
  copyBtn: { padding: 6 },

  /* Edit row */
  editRow: {
    flexDirection: "row", alignItems: "flex-start",
    padding: 16, gap: 12,
  },
  editRowFocused: { backgroundColor: "rgba(8,253,142,0.03)" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  inputPrefix: { color: theme.neon, fontSize: 15, fontWeight: "700" },
  inputSuffix: { color: theme.muted, fontSize: 13, fontWeight: "600" },
  textInput: {
    flex: 1, color: theme.text, fontSize: 15,
    fontWeight: "600", padding: 0, margin: 0, minHeight: 22,
  },
  textInputMulti: { minHeight: 60, textAlignVertical: "top" },
  charCount: { color: theme.muted, fontSize: 11, marginTop: 4, textAlign: "right" },

  /* Single picker dropdown */
  pickerValue: { color: theme.text, fontSize: 15, fontWeight: "600" },
  pickerPlaceholder: { color: theme.muted, fontSize: 15, fontWeight: "500" },
  dropdown: {
    backgroundColor: theme.surfaceRaised,
    borderTopWidth: 1, borderTopColor: theme.border, overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)",
  },
  dropdownOptionActive: { backgroundColor: "rgba(8,253,142,0.07)" },
  dropdownOptionText: { color: theme.muted, fontSize: 14, fontWeight: "600" },
  dropdownOptionTextActive: { color: theme.neon },

  /* Chip multi-select */
  chipRow: { padding: 16, gap: 12 },
  chipRowHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: "rgba(8,253,142,0.12)",
    borderColor: theme.neon,
  },
  chipText: { color: theme.muted, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: theme.neon },

  /* Unit toggle */
  unitToggle: {
    flexDirection: "row",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 8, borderWidth: 1, borderColor: theme.border,
    overflow: "hidden", flexShrink: 0,
  },
  unitBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  unitBtnActive: { backgroundColor: theme.neon },
  unitBtnText: { color: theme.muted, fontSize: 12, fontWeight: "700" },
  unitBtnTextActive: { color: theme.background },

  /* Google */
  googleCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 18, borderWidth: 1, borderColor: theme.border,
    padding: 16, gap: 14,
  },
  googleLogoWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  googleLogo: { fontSize: 22, fontWeight: "900", color: "#4285F4", lineHeight: 26 },
  googleTitle: { color: theme.text, fontSize: 14, fontWeight: "700", marginBottom: 2 },
  googleSub: { color: theme.muted, fontSize: 12, fontWeight: "500" },
  googleConnectBtn: {
    backgroundColor: theme.neon, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    minWidth: 80, alignItems: "center", justifyContent: "center",
  },
  googleConnectText: { color: theme.background, fontWeight: "900", fontSize: 13 },
  googleDisconnectBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(255,92,114,0.1)",
    borderWidth: 1, borderColor: "rgba(255,92,114,0.3)",
    alignItems: "center", justifyContent: "center",
  },

  /* Notice */
  notice: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "rgba(145,160,148,0.06)",
    borderRadius: 12, borderWidth: 1,
    borderColor: "rgba(145,160,148,0.12)",
    padding: 14, marginTop: 14,
  },
  noticeText: { flex: 1, color: theme.muted, fontSize: 12, lineHeight: 18, fontWeight: "500" },
});
