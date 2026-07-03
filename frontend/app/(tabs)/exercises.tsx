import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { exercises as exercisesApi } from '../../services/api';
import { ExerciseCard } from '../../components/ExerciseCard';
import { AICoachModal } from '../../components/AICoachModal';

interface ExerciseData {
  _id: string;
  name: string;
  muscleGroup: string;
  category: string;
  difficulty: string;
  equipment: string;
}

export default function ExercisesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [exerciseList, setExerciseList] = useState<ExerciseData[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [coachVisible, setCoachVisible] = useState(false);
  const [coachExercise, setCoachExercise] = useState('');

  const loadExercises = useCallback(async (query?: string) => {
    try {
      const data = await exercisesApi.list(query ? { search: query } : undefined);
      setExerciseList(data.exercises || []);
    } catch (err) {
      console.log('[EXERCISES] load error:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExercises(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadExercises]);

  useFocusEffect(useCallback(() => {
    loadExercises(search || undefined);
  }, [loadExercises, search]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  };

  const openCoach = (name: string) => {
    setCoachExercise(name);
    setCoachVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Exercises</Text>
          <TouchableOpacity
            style={[styles.chatBtn, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => router.push('/(tabs)/ai-chat')}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.primary} />
            <Text style={[styles.chatBtnText, { color: theme.colors.primary }]}>AI Chat</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.search, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Search exercises..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {exerciseList.map((ex) => (
          <ExerciseCard
            key={ex._id}
            exercise={ex}
            onPress={() => openCoach(ex.name)}
          />
        ))}
        {exerciseList.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {search ? `No exercises matching "${search}"` : 'No exercises found'}
          </Text>
        )}
      </ScrollView>

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
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  chatBtnText: { fontSize: 14, fontWeight: '600' },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  search: {
    flex: 1, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 16,
  },
  clearBtn: { marginLeft: 8, padding: 4 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 40 },
});
