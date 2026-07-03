import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Vibration, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { workouts as workoutsApi } from '../../services/api';
import { AICoachModal } from '../../components/AICoachModal';
import { ThemedButton } from '../../components/ThemedButton';

interface WorkoutData {
  _id: string;
  name: string;
  exercises: {
    _id: string;
    exercise: { _id: string; name: string };
    exerciseName: string;
    sets: { setNumber: number; reps: number; completed: boolean }[];
  }[];
  startTime: string;
}

type TimerStatus = 'idle' | 'running' | 'paused';

export default function ActiveWorkoutScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [pulse, setPulse] = useState(false);
  const [coachVisible, setCoachVisible] = useState(false);
  const [coachExercise, setCoachExercise] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedElapsed = useRef(0);

  const loadWorkout = useCallback(async () => {
    if (workoutId) {
      try {
        const data = await workoutsApi.getActive();
        if (data.workout) {
          setWorkout(data.workout);
        }
      } catch (err) {
        console.log('[ACTIVE] load error:', err);
      }
    }
  }, [workoutId]);

  useEffect(() => { loadWorkout(); }, [loadWorkout]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const tick = () => {
    Vibration.vibrate(15);
    setPulse(true);
    setTimeout(() => setPulse(false), 100);
  };

  const startTimer = () => {
    pausedElapsed.current = 0;
    setElapsed(0);
    setTimerStatus('running');
    tick();
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
      tick();
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    pausedElapsed.current = elapsed;
    setTimerStatus('paused');
  };

  const resumeTimer = () => {
    setTimerStatus('running');
    tick();
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
      tick();
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setElapsed(0);
    pausedElapsed.current = 0;
    setTimerStatus('idle');
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSet = (exerciseIdx: number, setIdx: number) => {
    if (!workout) return;
    const updated = { ...workout };
    updated.exercises[exerciseIdx].sets[setIdx].completed =
      !updated.exercises[exerciseIdx].sets[setIdx].completed;
    setWorkout(updated);
  };

  const updateSetReps = (exerciseIdx: number, setIdx: number, value: number) => {
    if (!workout) return;
    const updated = { ...workout };
    updated.exercises[exerciseIdx].sets[setIdx] = { ...updated.exercises[exerciseIdx].sets[setIdx], reps: value };
    setWorkout(updated);
  };

  const completeWorkout = async () => {
    if (!workout) return;
    Alert.alert('Complete Workout', 'Are you sure you want to finish?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            if (timerRef.current) clearInterval(timerRef.current);
            await workoutsApi.update(workout._id, { exercises: workout.exercises });
            await workoutsApi.complete(workout._id, { duration: Math.floor(elapsed) });
            router.replace('/(tabs)');
          } catch (err: unknown) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete');
          }
        },
      },
    ]);
  };

  const openCoach = (name: string) => {
    setCoachExercise(name);
    setCoachVisible(true);
  };

  const totalCompleted = workout
    ? workout.exercises.reduce((sum, ex) =>
        sum + ex.sets.filter(s => s.completed).length, 0
      )
    : 0;
  const totalSets = workout
    ? workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
    : 0;

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[{ color: theme.colors.textMuted, fontSize: 16 }]}>No active workout</Text>
        <ThemedButton title="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const ringGlow = timerStatus === 'running' ? '#00FF88' : timerStatus === 'paused' ? '#FFD700' : theme.colors.textMuted;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{workout.name}</Text>
          <Text style={[styles.headerProgress, { color: theme.colors.textSecondary }]}>
            {totalCompleted}/{totalSets} sets
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.timerSection}>
          <View style={[styles.neonRing, {
            borderColor: ringGlow,
            shadowColor: ringGlow,
          }]}>
            <View style={[styles.pulseRing, pulse && { borderColor: ringGlow }]} />
            <Text style={[styles.neonTimer, {
              color: ringGlow,
              textShadowColor: `${ringGlow}50`,
            }]}>
              {formatTime(elapsed)}
            </Text>
          </View>

          {timerStatus === 'idle' ? (
            <TouchableOpacity onPress={startTimer} style={[styles.startBtn, { borderColor: '#00FF88' }]}>
              <Ionicons name="play" size={32} color="#00FF88" />
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.controlsRow}>
              {timerStatus === 'running' ? (
                <TouchableOpacity onPress={pauseTimer} style={[styles.ctrlBtn, { borderColor: '#FFD700' }]}>
                  <Ionicons name="pause" size={22} color="#FFD700" />
                  <Text style={[styles.ctrlBtnText, { color: '#FFD700' }]}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={resumeTimer} style={[styles.ctrlBtn, { borderColor: '#00FF88' }]}>
                  <Ionicons name="play" size={22} color="#00FF88" />
                  <Text style={[styles.ctrlBtnText, { color: '#00FF88' }]}>Resume</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={stopTimer} style={[styles.ctrlBtn, { borderColor: '#FF4444' }]}>
                <Ionicons name="stop" size={22} color="#FF4444" />
                <Text style={[styles.ctrlBtnText, { color: '#FF4444' }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {workout.exercises.map((entry, exIdx) => (
          <View key={entry._id || exIdx} style={[styles.exerciseBlock, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.exerciseHeader}>
              <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{entry.exerciseName}</Text>
              <TouchableOpacity onPress={() => openCoach(entry.exerciseName)}>
                <Text style={[styles.coachBtn, { color: theme.colors.primary }]}>AI Coach</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.setsHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.setCol, { color: theme.colors.textMuted }]}>Set</Text>
              <Text style={[styles.setCol, { color: theme.colors.textMuted }]}>Reps</Text>
              <Text style={[styles.setCol, { color: theme.colors.textMuted }]}>Done</Text>
            </View>

            {entry.sets.map((set, sIdx) => (
              <View key={sIdx} style={[styles.setRow, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.setCol, { color: theme.colors.text }]}>{set.setNumber}</Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Reps', 'Enter reps', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'OK',
                        onPress: () => {
                          Alert.prompt?.('Reps', 'Enter number of reps', (val) => {
                            updateSetReps(exIdx, sIdx, parseInt(val) || 0);
                          });
                        },
                      },
                    ]);
                  }}
                  style={styles.setCol}
                >
                  <Text style={[styles.setColValue, { color: theme.colors.primary }]}>
                    {set.reps > 0 ? `${set.reps}` : 'Tap'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleSet(exIdx, sIdx)}
                  style={[styles.checkBox, {
                    backgroundColor: set.completed ? theme.colors.success : 'transparent',
                    borderColor: set.completed ? theme.colors.success : theme.colors.textMuted,
                  }]}
                >
                  {set.completed && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.colors.tabBar, borderTopColor: theme.colors.border }]}>
        <ThemedButton title="Complete Workout" onPress={completeWorkout} variant="secondary" />
      </View>

      <AICoachModal
        visible={coachVisible}
        exerciseName={coachExercise}
        onClose={() => setCoachVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8,
  },
  backBtn: { width: 40 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerProgress: { fontSize: 12, marginTop: 1 },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 20 },
  timerSection: {
    alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20,
  },
  neonRing: {
    width: 200, height: 200, borderRadius: 100, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20,
  },
  pulseRing: {
    position: 'absolute', width: 210, height: 210, borderRadius: 105,
    borderWidth: 2, borderColor: 'transparent',
  },
  neonTimer: {
    fontSize: 42, fontWeight: '800', fontVariant: ['tabular-nums'],
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18,
  },
  startBtn: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,255,136,0.08)',
  },
  startBtnText: { color: '#00FF88', fontSize: 14, fontWeight: '700', marginTop: 2 },
  controlsRow: { flexDirection: 'row', gap: 28 },
  ctrlBtn: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  ctrlBtnText: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  exerciseBlock: {
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, marginHorizontal: 16,
  },
  exerciseHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  exerciseName: { fontSize: 16, fontWeight: '600' },
  coachBtn: { fontSize: 13, fontWeight: '600' },
  setsHeader: {
    flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 6, marginBottom: 6,
  },
  setRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5,
  },
  setCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  setColValue: { fontSize: 14, fontWeight: '500' },
  checkBox: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 12 },
  bottomBar: { padding: 16, borderTopWidth: 1 },
});
