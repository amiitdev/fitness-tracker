import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { workouts as workoutsApi } from '../../services/api';
import { ThemedButton } from '../../components/ThemedButton';

interface WorkoutData {
  _id: string;
  name: string;
  exercises: {
    _id: string;
    exerciseName: string;
    sets: { setNumber: number; reps: number; completed: boolean }[];
  }[];
  startTime: string;
  endTime: string;
  duration: number;
  totalVolume: number;
  status: string;
}

export default function WorkoutDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorkout = useCallback(async () => {
    if (!workoutId) return;
    try {
      const data = await workoutsApi.list();
      const found = data.workouts?.find((w: WorkoutData) => w._id === workoutId);
      if (found) setWorkout(found);
    } catch { } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => { loadWorkout(); }, [loadWorkout]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[{ color: theme.colors.textMuted, fontSize: 16 }]}>Workout not found</Text>
        <ThemedButton title="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const totalReps = workout.exercises.reduce((sum, ex) =>
    sum + ex.sets.reduce((s, set) => s + set.reps, 0), 0
  );
  const totalCompletedSets = workout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed).length, 0
  );
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{workout.name}</Text>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
          {formatDate(workout.startTime)} at {formatTime(workout.startTime)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{totalReps}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Reps</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {totalCompletedSets}/{totalSets}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Sets</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {formatDuration(workout.duration)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Duration</Text>
        </View>
      </View>

      {workout.exercises.map((entry, idx) => (
        <View key={entry._id || idx} style={[styles.exerciseBlock, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{entry.exerciseName}</Text>
          {entry.sets.map((set, sIdx) => (
            <View key={sIdx} style={[styles.setRow, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.setLabel, { color: theme.colors.textMuted }]}>Set {set.setNumber}</Text>
              <Text style={[styles.setReps, { color: theme.colors.text }]}>{set.reps} reps</Text>
              <Text style={[styles.setStatus, { color: set.completed ? theme.colors.success : theme.colors.textMuted }]}>
                {set.completed ? '✓ Done' : '—'}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <ThemedButton title="Back to History" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  date: { fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  exerciseBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  exerciseName: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  setLabel: { flex: 1, fontSize: 13 },
  setReps: { flex: 1, fontSize: 14, fontWeight: '600' },
  setStatus: { flex: 1, fontSize: 13, textAlign: 'right' },
  footer: { padding: 20, paddingBottom: 40 },
});
