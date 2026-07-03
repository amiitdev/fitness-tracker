import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Workout {
  _id: string;
  name: string;
  exercises: { exerciseName: string; sets: unknown[] }[];
  startTime: string;
  endTime?: string;
  duration: number;
  totalVolume: number;
  status: string;
}

interface Props {
  workout: Workout;
  onPress?: () => void;
}

export function WorkoutCard({ workout, onPress }: Props) {
  const { theme } = useTheme();
  const date = new Date(workout.startTime).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{workout.name}</Text>
        <Text style={[styles.status, {
          color: workout.status === 'completed' ? theme.colors.success : theme.colors.warning,
        }]}>
          {workout.status === 'completed' ? 'Done' : 'Active'}
        </Text>
      </View>
      <Text style={[styles.date, { color: theme.colors.textMuted }]}>{date}</Text>
      <View style={styles.stats}>
        <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
          {workout.exercises.length} exercises
        </Text>
        {workout.status === 'completed' && (
          <>
            <Text style={[styles.statDot, { color: theme.colors.textMuted }]}>·</Text>
            <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
              {formatTime(workout.duration)}
            </Text>
            <Text style={[styles.statDot, { color: theme.colors.textMuted }]}>·</Text>
            <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
              {workout.totalVolume.toLocaleString()} reps
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 13,
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stat: {
    fontSize: 13,
  },
  statDot: {
    fontSize: 16,
  },
});
