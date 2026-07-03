import { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { workouts as workoutsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface WorkoutData {
  _id: string;
  name: string;
  status: string;
  startTime: string;
  endTime?: string;
  duration: number;
  totalVolume: number;
  exercises: { exerciseName: string; sets: { reps: number; completed: boolean }[] }[];
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [workoutList, setWorkoutList] = useState<WorkoutData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = useCallback(async () => {
    try {
      const data = await workoutsApi.list();
      setWorkoutList(data.workouts || []);
    } catch (err) {
      console.log('[HISTORY] load error:', err);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadWorkouts();
  }, [loadWorkouts]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const deleteWorkout = (id: string, name: string) => {
    Alert.alert('Delete Workout', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await workoutsApi.delete(id);
            loadWorkouts();
          } catch (err: unknown) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return d.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const renderWorkout = ({ item }: { item: WorkoutData }) => {
    const totalReps = item.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + set.reps, 0), 0
    );
    const completedSets = item.exercises.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.completed).length, 0
    );
    const totalSets = item.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/(tabs)/workout-detail', params: { workoutId: item._id } })}
        onLongPress={() => deleteWorkout(item._id, item.name)}
        style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardName, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.cardDate, { color: theme.colors.textSecondary }]}>
            {formatDate(item.startTime)}
          </Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.metaItem, { color: theme.colors.textMuted }]}>
            {item.exercises.length} exercises
          </Text>
          <Text style={[styles.metaDot, { color: theme.colors.textMuted }]}>·</Text>
          <Text style={[styles.metaItem, { color: theme.colors.textMuted }]}>
            {totalReps} reps
          </Text>
          {item.status === 'completed' && (
            <>
              <Text style={[styles.metaDot, { color: theme.colors.textMuted }]}>·</Text>
              <Text style={[styles.metaItem, { color: theme.colors.textMuted }]}>
                {formatDuration(item.duration)}
              </Text>
              <Text style={[styles.metaDot, { color: theme.colors.textMuted }]}>·</Text>
              <Text style={[styles.metaItem, { color: theme.colors.success }]}>
                {completedSets}/{totalSets} sets
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>History</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {workoutList.length} workout{workoutList.length !== 1 ? 's' : ''}
          {' · '}Long press to delete
        </Text>
      </View>

      <FlatList
        data={workoutList}
        keyExtractor={(item) => item._id}
        renderItem={renderWorkout}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              No workouts completed yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
              Start a calisthenics routine to see your history here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  cardName: { fontSize: 16, fontWeight: '600' },
  cardDate: { fontSize: 13, fontWeight: '500' },
  cardMeta: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4,
  },
  metaItem: { fontSize: 13 },
  metaDot: { fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
});
