import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Exercise {
  _id: string;
  name: string;
  muscleGroup: string;
  category: string;
  difficulty: string;
  equipment: string;
}

interface Props {
  exercise: Exercise;
  onPress?: () => void;
}

const MUSCLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Chest': 'fitness-outline',
  'Back': 'body-outline',
  'Legs': 'accessibility-outline',
  'Core': 'ellipse-outline',
  'Arms': 'hand-left-outline',
  'Shoulders': 'body-outline',
  'Full Body': 'walk-outline',
};

const MUSCLE_COLORS: Record<string, string> = {
  'Chest': '#FF6B6B',
  'Back': '#4ECDC4',
  'Legs': '#FFD93D',
  'Core': '#6C5CE7',
  'Arms': '#A29BFE',
  'Shoulders': '#FD79A8',
  'Full Body': '#00CEC9',
};

export function ExerciseCard({ exercise, onPress }: Props) {
  const { theme } = useTheme();

  const difficultyColors: Record<string, string> = {
    beginner: '#4CAF50',
    intermediate: '#FFB74D',
    advanced: '#EF5350',
  };

  const iconName = MUSCLE_ICONS[exercise.muscleGroup] || 'fitness-outline';
  const iconColor = MUSCLE_COLORS[exercise.muscleGroup] || theme.colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{exercise.name}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[exercise.difficulty] + '20' }]}>
              <Text style={[styles.difficultyText, { color: difficultyColors[exercise.difficulty] }]}>
                {exercise.difficulty}
              </Text>
            </View>
          </View>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={[styles.tagText, { color: iconColor }]}>{exercise.muscleGroup}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{exercise.equipment}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{exercise.category}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
