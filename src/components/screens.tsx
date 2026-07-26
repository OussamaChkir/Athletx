import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { router } from "expo-router";
import { Dumbbell, Flame, Play, Plus, Search, Trash2 } from "lucide-react-native";
import { EQUIPMENT_LIST, FOCUS_PRESETS, MUSCLES, MUSCLE_COLORS } from "@/lib/constants";
import { createWorkoutExercise, filterExercises, getExerciseById } from "@/lib/exercises";
import { theme } from "@/lib/theme";
import type { WorkoutExercise, WorkoutFocus } from "@/lib/types";
import { useWorkoutStore } from "@/store/workout-store";

const card = { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 16 } as const;
function Pill({ label, active, onPress }: { label: string; active: boolean; onPress(): void }) { return <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}><Text style={[styles.pillText, active && styles.neon]}>{label}</Text></Pressable>; }
export function TrainScreen() { const [step, setStep] = useState(0); const s = useWorkoutStore(); const canNext = step === 0 ? s.equipment.length > 0 : step === 1 ? s.muscles.length > 0 : true; const generate = () => { if (!s.generate().length) return Alert.alert("No matching exercises", "Choose more equipment or muscles."); router.navigate("/(tabs)/builder"); };
 return <ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>ATHLETX</Text><Text style={styles.hero}>Train smarter.{"\n"}<Text style={styles.neon}>Move better.</Text></Text><View style={styles.stats}><Stat value={`${new Set(s.history.map(x => x.completedAt.slice(0, 10))).size}d`} label="Streak"/><Stat value={String(s.history.length)} label="Sessions"/><Stat value={String(s.currentWorkout.length)} label="Ready"/></View><View style={styles.steps}>{["Equipment", "Muscles", "Dial in"].map((x,i)=><Pill key={x} label={`${i+1}. ${x}`} active={step===i} onPress={()=>i<=step && setStep(i)}/>)}</View>{step===0 && <><Text style={styles.title}>Your equipment</Text><View style={styles.grid}>{EQUIPMENT_LIST.map(e=><Pill key={e.id} label={e.label} active={s.equipment.includes(e.id)} onPress={()=>s.toggleEquipment(e.id)}/>)}</View></>}{step===1 && <><Text style={styles.title}>Target muscles</Text><View style={styles.grid}>{MUSCLES.map(m=><Pill key={m.id} label={m.label} active={s.muscles.includes(m.id)} onPress={()=>s.toggleMuscle(m.id)}/>)}</View></>}{step===2 && <><Text style={styles.title}>Dial in</Text>{(Object.keys(FOCUS_PRESETS) as WorkoutFocus[]).map(k=><Pressable key={k} style={[styles.focus, s.focus===k && styles.focusActive]} onPress={()=>s.setFocus(k)}><Text style={styles.cardTitle}>{FOCUS_PRESETS[k].label}</Text><Text style={styles.muted}>{FOCUS_PRESETS[k].sets}×{FOCUS_PRESETS[k].reps} · {FOCUS_PRESETS[k].restSeconds}s — {FOCUS_PRESETS[k].blurb}</Text></Pressable>)}<Text style={styles.muted}>Exercises: {s.exerciseCount}</Text><View style={styles.steps}>{[4,6,8,10,12].map(n=><Pill key={n} label={String(n)} active={s.exerciseCount===n} onPress={()=>s.setExerciseCount(n)}/>)}</View></>}<Pressable disabled={!canNext} style={[styles.button,!canNext&&styles.disabled]} onPress={()=>step<2?setStep(step+1):generate()}><Text style={styles.buttonText}>{step<2?"Continue":"Generate workout"}</Text></Pressable></ScrollView> }
function Stat({value,label}:{value:string;label:string}) { return <View style={[card,styles.stat]}><Text style={styles.statValue}>{value}</Text><Text style={styles.small}>{label}</Text></View> }
export function LibraryScreen() { const [query,setQuery]=useState(""); const add=useWorkoutStore(s=>s.addExercise); const exercises=useMemo(()=>filterExercises({search:query}),[query]); return <View style={styles.page}><Text style={styles.title}>Exercise library</Text><View style={styles.search}><Search color={theme.muted} size={18}/><TextInput placeholder="Search exercises" placeholderTextColor={theme.muted} value={query} onChangeText={setQuery} style={styles.input}/></View><FlatList data={exercises} keyExtractor={x=>x._id} renderItem={({item})=><Pressable style={styles.exercise} onPress={()=>router.push(`/exercise/${item._id}`)}><View style={[styles.dot,{backgroundColor:MUSCLE_COLORS[item.mainMuscle ?? ""] ?? theme.neon}]}/><View style={{flex:1}}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.muted}>{item.mainMuscle} · {item.difficulty}</Text></View><Pressable hitSlop={10} onPress={()=>{add(createWorkoutExercise(item,"hypertrophy")); Alert.alert("Added",`${item.title} is in your builder.`)}}><Plus color={theme.neon}/></Pressable></Pressable>}/></View> }
export function BuilderScreen() { const s=useWorkoutStore(); const render=({item,drag,isActive}:RenderItemParams<WorkoutExercise>)=><Pressable onLongPress={drag} disabled={isActive} style={[styles.exercise,isActive&&{opacity:.7}]}><View style={[styles.dot,{backgroundColor:MUSCLE_COLORS[item.mainMuscle]??theme.neon}]}/><View style={{flex:1}}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.muted}>{item.sets} sets × {item.reps} reps · {item.restSeconds}s rest</Text><View style={styles.steps}>{["sets","reps","restSeconds"].map(k=><Pressable key={k} style={styles.edit} onPress={()=>s.updateExercise(item.instanceId,{[k]: Math.max(0, Number(item[k as keyof WorkoutExercise])+1)} as Partial<WorkoutExercise>)}><Text style={styles.small}>+ {k}</Text></Pressable>)}</View></View><Pressable onPress={()=>s.removeExercise(item.instanceId)}><Trash2 color={theme.danger}/></Pressable></Pressable>; if(!s.currentWorkout.length) return <View style={[styles.page,styles.center]}><Dumbbell color={theme.neon} size={42}/><Text style={styles.title}>Empty rack</Text><Text style={styles.muted}>Generate a workout or add moves from Library.</Text></View>; return <View style={styles.page}><TextInput value={s.workoutName} onChangeText={s.setWorkoutName} style={styles.name} placeholder="Workout name" placeholderTextColor={theme.muted}/><DraggableFlatList data={s.currentWorkout} keyExtractor={x=>x.instanceId} renderItem={render} onDragEnd={({data})=>s.reorderExercises(0,0) || useWorkoutStore.setState({currentWorkout:data})}/><Pressable style={styles.button} onPress={()=>{s.saveCurrentWorkout();s.startLiveSession();router.push("/live")}}><Play fill={theme.background} color={theme.background}/><Text style={styles.buttonText}>Start workout</Text></Pressable></View> }
export function HistoryScreen() { const history=useWorkoutStore(s=>s.history); return <FlatList contentContainerStyle={styles.page} data={history} keyExtractor={x=>x.id} ListHeaderComponent={<><Text style={styles.title}>History</Text><Text style={styles.muted}>{history.length} completed sessions</Text></>} ListEmptyComponent={<Text style={styles.muted}>Finish a live workout to see it here.</Text>} renderItem={({item})=><View style={styles.exercise}><Flame color={theme.ember}/><View><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{new Date(item.completedAt).toLocaleDateString()} · {item.totalSets} sets</Text></View></View>}/> }
export function LiveScreen() { const s=useWorkoutStore(); const [elapsed,setElapsed]=useState(0); const ex=s.currentWorkout[s.liveIndex]; useEffect(()=>{const id=setInterval(()=>{setElapsed(n=>n+1);s.tickRest()},1000);return()=>clearInterval(id)},[s]); if(!ex) return null; if(s.livePhase==="done") return <View style={[styles.page,styles.center]}><Text style={styles.hero}>Workout complete</Text><Pressable style={styles.button} onPress={()=>{s.finishWorkout(elapsed);router.replace("/(tabs)/history")}}><Text style={styles.buttonText}>Save to history</Text></Pressable></View>; return <View style={[styles.page,styles.center]}><Text style={styles.eyebrow}>{s.livePhase === "rest" ? "REST" : `EXERCISE ${s.liveIndex+1}/${s.currentWorkout.length}`}</Text><Text style={styles.hero}>{s.livePhase === "rest" ? `${s.restRemaining}s` : ex.title}</Text><Text style={styles.muted}>{s.livePhase === "rest" ? "Breathe. Reset. Go again." : `Set ${s.liveSet} of ${ex.sets} · ${ex.reps} reps`}</Text><Pressable style={styles.button} onPress={()=>s.livePhase==="rest"?s.skipRest():s.completeSet()}><Text style={styles.buttonText}>{s.livePhase==="rest"?"Skip rest":"Complete set"}</Text></Pressable></View> }

export function ExerciseDetail({ id }: { id: string }) {
  const e = getExerciseById(id);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  if (!e) return <View style={styles.page}><Text style={styles.title}>Exercise not found</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Title & meta */}
      <Text style={styles.title}>{e.title}</Text>
      <Text style={styles.muted}>{e.mainMuscle} · {e.difficulty} · {e.category}</Text>

      {/* Image */}
      <View style={styles.imageCard}>
        {imgLoading && !imgError && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator color={theme.neon} size="large" />
          </View>
        )}
        {imgError ? (
          <View style={styles.imagePlaceholder}>
            <Dumbbell color={theme.muted} size={40} />
            <Text style={[styles.muted, { marginTop: 8, textAlign: "center" }]}>
              No image available.{"\n"}Update the image URL manually.
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: e.image }}
            style={styles.image}
            contentFit="cover"
            onLoadStart={() => { setImgLoading(true); setImgError(false); }}
            onLoad={() => setImgLoading(false)}
            onError={() => { setImgLoading(false); setImgError(true); }}
          />
        )}
      </View>

      {/* Equipment tags */}
      {e.equipment?.length > 0 && (
        <View style={styles.steps}>
          {e.equipment.map(eq => (
            <View key={eq} style={styles.pill}>
              <Text style={styles.pillText}>{eq}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Steps */}
      <Text style={styles.eyebrow}>HOW TO</Text>
      {e.steps.map((x, i) => (
        <View key={x} style={styles.stepRow}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
          <Text style={styles.step}>{x}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles=StyleSheet.create({page:{flexGrow:1,backgroundColor:theme.background,padding:20,gap:14},center:{justifyContent:"center",alignItems:"center"},eyebrow:{color:theme.neon,fontSize:12,fontWeight:"800",letterSpacing:2},hero:{color:theme.text,fontSize:32,fontWeight:"900"},neon:{color:theme.neon},title:{color:theme.text,fontSize:24,fontWeight:"800"},muted:{color:theme.muted,fontSize:13},small:{color:theme.muted,fontSize:11,textTransform:"uppercase"},stats:{flexDirection:"row",gap:8},stat:{flex:1,padding:12,alignItems:"center"},statValue:{color:theme.neon,fontSize:20,fontWeight:"800"},steps:{flexDirection:"row",flexWrap:"wrap",gap:8},grid:{flexDirection:"row",flexWrap:"wrap",gap:8},pill:{borderWidth:1,borderColor:theme.border,paddingHorizontal:11,paddingVertical:9,borderRadius:99},pillActive:{borderColor:theme.neon,backgroundColor:"#173d18"},pillText:{color:theme.muted,fontSize:12,fontWeight:"700"},focus:{...card,padding:14,gap:5},focusActive:{borderColor:theme.neon,backgroundColor:"#132c15"},button:{backgroundColor:theme.neon,borderRadius:14,padding:16,alignItems:"center",justifyContent:"center",flexDirection:"row",gap:8,marginTop:8},disabled:{opacity:.4},buttonText:{color:theme.background,fontWeight:"900"},search:{...card,flexDirection:"row",alignItems:"center",paddingHorizontal:12},input:{flex:1,color:theme.text,padding:12},exercise:{...card,flexDirection:"row",alignItems:"center",gap:12,padding:14,marginBottom:10},dot:{height:10,width:10,borderRadius:10},cardTitle:{color:theme.text,fontWeight:"800",fontSize:15},name:{...card,color:theme.text,padding:14,fontSize:18,fontWeight:"800"},edit:{borderWidth:1,borderColor:theme.border,borderRadius:7,padding:5},step:{color:theme.text,lineHeight:23,fontSize:15,flex:1},
  imageCard:{backgroundColor:theme.surface,borderRadius:20,borderWidth:1,borderColor:theme.neon,overflow:"hidden",marginBottom:4},
  image:{width:"100%",height:260},
  imagePlaceholder:{height:220,alignItems:"center",justifyContent:"center",gap:8},
  stepRow:{flexDirection:"row",alignItems:"flex-start",gap:12},
  stepNum:{width:28,height:28,borderRadius:14,backgroundColor:"#173d18",borderWidth:1,borderColor:theme.neon,alignItems:"center",justifyContent:"center",marginTop:2},
  stepNumText:{color:theme.neon,fontWeight:"900",fontSize:13},
});

