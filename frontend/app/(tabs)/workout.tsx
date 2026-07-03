import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { exercises as exercisesApi, workouts as workoutsApi } from '../../services/api';
import { ThemedButton } from '../../components/ThemedButton';

console.log('[WORKOUT] workout.tsx loaded');

interface ExerciseData {
  _id: string;
  name: string;
}

interface SetData {
  setNumber: number;
  reps: number;
  completed: boolean;
}

interface SelectedExercise {
  _id: string;
  name: string;
  sets: SetData[];
}

const PRESET_WORKOUTS = [
  {
    name: 'Push Day',
    description: 'Chest, shoulders & triceps',
    icon: '💪',
    exercises: ['Standard Push Up', 'Diamond Push Up', 'Decline Push Up', 'Tricep Dip', 'Parallel Bar Dip'],
    defaultSets: 3,
    defaultReps: 12,
  },
  {
    name: 'Pull Day',
    description: 'Back & biceps',
    icon: '🔥',
    exercises: ['Pull Up', 'Chin Up', 'Wide Pull Up', 'Australian Row'],
    defaultSets: 3,
    defaultReps: 8,
  },
  {
    name: 'Leg Day',
    description: 'Quads, glutes & hamstrings',
    icon: '🦵',
    exercises: ['Bodyweight Squat', 'Bulgarian Split Squat', 'Walking Lunge', 'Glute Bridge', 'Calf Raise'],
    defaultSets: 3,
    defaultReps: 15,
  },
  {
    name: 'Core Crusher',
    description: 'Six-pack & stability',
    icon: '🎯',
    exercises: ['Plank', 'Leg Raise', 'Russian Twist', 'Mountain Climber', 'Side Plank'],
    defaultSets: 3,
    defaultReps: 15,
  },
  {
    name: 'Full Body Blast',
    description: 'Total body conditioning',
    icon: '⚡',
    exercises: ['Burpee', 'Pull Up', 'Standard Push Up', 'Bodyweight Squat', 'Plank'],
    defaultSets: 3,
    defaultReps: 10,
  },
];

export default function WorkoutScreen() {
  console.log('[WORKOUT] WorkoutScreen() rendering');
  const { theme } = useTheme();
  const router = useRouter();
  const [exerciseList, setExerciseList] = useState<ExerciseData[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('My Workout');
  const [showPresets, setShowPresets] = useState(true);
  const [exerciseSearch, setExerciseSearch] = useState('');

  const loadExercises = useCallback(async () => {
    console.log('[WORKOUT] loadExercises()');
    try {
      const data = await exercisesApi.list();
      console.log('[WORKOUT] exercises loaded:', data.exercises?.length);
      setExerciseList(data.exercises || []);
    } catch (err) {
      console.log('[WORKOUT] load error:', err);
    }
  }, []);

  useEffect(() => { loadExercises(); }, [loadExercises]);

  const toggleExercise = (ex: ExerciseData) => {
    console.log('[WORKOUT] toggleExercise:', ex.name);
    setSelectedExercises(prev => {
      const exists = prev.find(e => e._id === ex._id);
      if (exists) return prev.filter(e => e._id !== ex._id);
      return [...prev, { _id: ex._id, name: ex.name, sets: [{ setNumber: 1, reps: 10, completed: false }] }];
    });
  };

  const addSet = (exerciseId: string) => {
    console.log('[WORKOUT] addSet:', exerciseId);
    setSelectedExercises(prev => prev.map(e => {
      if (e._id !== exerciseId) return e;
      return { ...e, sets: [...e.sets, { setNumber: e.sets.length + 1, reps: 10, completed: false }] };
    }));
  };

  const removeExercise = (exerciseId: string) => {
    console.log('[WORKOUT] removeExercise:', exerciseId);
    setSelectedExercises(prev => prev.filter(e => e._id !== exerciseId));
  };

  const applyPreset = (preset: typeof PRESET_WORKOUTS[number]) => {
    console.log('[WORKOUT] applyPreset:', preset.name);
    setWorkoutName(preset.name);
    const matched: SelectedExercise[] = [];

    for (const exName of preset.exercises) {
      const found = exerciseList.find(e =>
        e.name.toLowerCase().trim() === exName.toLowerCase().trim()
      );
      if (found) {
        matched.push({
          _id: found._id,
          name: found.name,
          sets: Array.from({ length: preset.defaultSets }, (_, i) => ({
            setNumber: i + 1,
            reps: preset.defaultReps,
            completed: false,
          })),
        });
      }
    }

    if (matched.length === 0) {
      Alert.alert('Error', 'No matching exercises found. Make sure the database is seeded.');
      return;
    }

    setSelectedExercises(matched);
    setShowPresets(false);
  };

  const startWorkout = async () => {
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Add at least one exercise');
      return;
    }

    try {
      const payload = {
        name: workoutName,
        exercises: selectedExercises.map(e => ({
          exercise: e._id,
          exerciseName: e.name,
          sets: e.sets,
        })),
      };

      console.log('[WORKOUT] creating workout:', payload.name);
      const data = await workoutsApi.create(payload);
      console.log('[WORKOUT] created:', data.workout._id);
      router.push({ pathname: '/(tabs)/active-workout', params: { workoutId: data.workout._id } });
    } catch (err: unknown) {
      console.log('[WORKOUT] create error:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to start workout');
    }
  };

  const hasActive = async () => {
    try {
      const data = await workoutsApi.getActive();
      if (data.workout) {
        Alert.alert('Active Workout', 'You have an active workout. Continue it?', [
          { text: 'Continue', onPress: () => router.push({ pathname: '/(tabs)/active-workout', params: { workoutId: data.workout._id } }) },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    } catch {}
  };

  useEffect(() => { hasActive(); }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={[styles.scrollArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Workout</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Choose a preset or build your own
          </Text>
        </View>

        {showPresets ? (
          <View style={styles.presetsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Calisthenics Routines</Text>
            {PRESET_WORKOUTS.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.presetCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => applyPreset(preset)}
                activeOpacity={0.7}
              >
                <View style={styles.presetHeader}>
                  <Text style={styles.presetIcon}>{preset.icon}</Text>
                  <View style={styles.presetInfo}>
                    <Text style={[styles.presetName, { color: theme.colors.text }]}>{preset.name}</Text>
                    <Text style={[styles.presetDesc, { color: theme.colors.textSecondary }]}>{preset.description}</Text>
                  </View>
                </View>
                <View style={[styles.presetMeta, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.presetMetaText, { color: theme.colors.textMuted }]}>
                    {preset.exercises.length} exercises · {preset.defaultSets}×{preset.defaultReps}
                  </Text>
                  <Text style={[styles.presetStart, { color: theme.colors.primary }]}>Select →</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowPresets(false)}
              style={[styles.customButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
            >
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={[styles.customButtonText, { color: '#fff' }]}>
                Build Custom Workout
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.customHeader}>
              <View style={styles.customHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Build Your Workout</Text>
                <TouchableOpacity onPress={() => { setShowPresets(true); setSelectedExercises([]); }}>
                  <Text style={[styles.backPresets, { color: theme.colors.primary }]}>← Presets</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.nameInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Workout name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            {selectedExercises.length > 0 && (
              <View style={styles.selectedSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Selected ({selectedExercises.length})
                </Text>
                {selectedExercises.map(ex => (
                  <View key={ex._id} style={[styles.selectedItem, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
                    <View style={styles.selectedItemHeader}>
                      <Text style={[styles.selectedItemName, { color: theme.colors.text }]}>{ex.name}</Text>
                      <TouchableOpacity onPress={() => removeExercise(ex._id)}>
                        <Text style={[styles.removeBtn, { color: theme.colors.error }]}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                    {ex.sets.map((set, sIdx) => (
                      <View key={sIdx} style={styles.setEditRow}>
                        <Text style={[styles.setEditLabel, { color: theme.colors.textMuted }]}>Set {set.setNumber}:</Text>
                        <TextInput
                          style={[styles.repsInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
                          value={String(set.reps)}
                          onChangeText={(val) => {
                            const num = parseInt(val) || 0;
                            setSelectedExercises(prev => prev.map(e => {
                              if (e._id !== ex._id) return e;
                              const newSets = [...e.sets];
                              newSets[sIdx] = { ...newSets[sIdx], reps: num };
                              return { ...e, sets: newSets };
                            }));
                          }}
                          keyboardType="number-pad"
                          placeholder="reps"
                          placeholderTextColor={theme.colors.textMuted}
                        />
                        <Text style={[styles.setEditRepsLabel, { color: theme.colors.textSecondary }]}>reps</Text>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => addSet(ex._id)}>
                      <Text style={[styles.addSetBtn, { color: theme.colors.primary }]}>+ Add Set</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.exercisesSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>All Exercises</Text>
              <TextInput
                style={[styles.exSearchInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="Search exercises..."
                placeholderTextColor={theme.colors.textMuted}
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
              />
              {exerciseList.filter(e =>
                !exerciseSearch || e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
              ).map((item) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => toggleExercise(item)}
                  style={[
                    styles.exerciseOption,
                    {
                      backgroundColor: selectedExercises.find(e => e._id === item._id)
                        ? theme.colors.primary + '20' : theme.colors.card,
                      borderColor: selectedExercises.find(e => e._id === item._id)
                        ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{item.name}</Text>
                  {selectedExercises.find(e => e._id === item._id) && (
                    <Text style={[styles.checkMark, { color: theme.colors.primary }]}>Selected</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {!showPresets && selectedExercises.length > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: theme.colors.tabBar, borderTopColor: theme.colors.border }]}>
          <ThemedButton title={`Start Workout (${selectedExercises.length})`} onPress={startWorkout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  presetsSection: { paddingHorizontal: 20, paddingBottom: 30 },
  presetCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  presetIcon: { fontSize: 32, marginRight: 14 },
  presetInfo: { flex: 1 },
  presetName: { fontSize: 17, fontWeight: '700' },
  presetDesc: { fontSize: 13, marginTop: 2 },
  presetMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  presetMetaText: { fontSize: 12 },
  presetStart: { fontSize: 14, fontWeight: '700' },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 12,
    marginBottom: 20,
  },
  customButtonText: { fontSize: 15, fontWeight: '700' },
  customHeader: { paddingHorizontal: 20, marginBottom: 12 },
  customHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nameInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16 },
  backPresets: { fontSize: 14, fontWeight: '600' },
  selectedSection: { paddingHorizontal: 20, marginBottom: 12 },
  selectedItem: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  selectedItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedItemName: { fontSize: 15, fontWeight: '600' },
  removeBtn: { fontSize: 13, fontWeight: '500' },
  setEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  setEditLabel: { fontSize: 13, width: 50 },
  repsInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    width: 60,
    textAlign: 'center',
  },
  setEditRepsLabel: { fontSize: 13 },
  addSetBtn: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  exercisesSection: { paddingHorizontal: 20, paddingBottom: 100 },
  exerciseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  exerciseName: { fontSize: 15, fontWeight: '500' },
  checkMark: { fontSize: 13, fontWeight: '600' },
  exSearchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
  },
});
