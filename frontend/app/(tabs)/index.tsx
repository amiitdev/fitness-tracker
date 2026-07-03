import { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { workouts as workoutsApi } from '../../services/api';
import { WorkoutCard } from '../../components/WorkoutCard';

interface WorkoutData {
  _id: string;
  name: string;
  status: string;
  startTime: string;
  duration: number;
  totalVolume: number;
  exercises: unknown[];
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, totalVolume: 0 });

  const loadData = useCallback(async () => {
    try {
      const data = await workoutsApi.list();
      const list: WorkoutData[] = data.workouts || [];
      setRecentWorkouts(list.slice(0, 5));

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const completed = list.filter(w => w.status === 'completed');
      const thisWeek = completed.filter(w => new Date(w.startTime) >= weekStart);
      const totalVolume = completed.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

      setStats({ total: completed.length, thisWeek: thisWeek.length, totalVolume });
    } catch (err) {
      console.log('[HOME] loadData error:', err);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const formatVolume = (v: number) => {
    if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
    return String(v);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          {greeting}, {user?.name || 'Athlete'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Ready to crush your goals?</Text>
      </View>

      <View style={[styles.statsRow, { borderColor: theme.colors.border }]}>
        <View style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>
            Workouts
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.thisWeek}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>
            This Week
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {formatVolume(stats.totalVolume)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>
            Total Reps
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/(tabs)/workout')}
      >
        <Text style={[styles.startButtonText, { color: theme.colors.background }]}>
          Start Workout
        </Text>
      </TouchableOpacity>

      <View style={styles.recentSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Workouts</Text>
        {recentWorkouts.length > 0 ? (
          recentWorkouts.map(w => (
            <WorkoutCard key={w._id} workout={w as never} />
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            No workouts yet. Start your first one!
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  greeting: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 3, textAlign: 'center' },
  startButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  startButtonText: { fontSize: 18, fontWeight: '700' },
  recentSection: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 20 },
});
