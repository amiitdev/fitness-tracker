import { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ai } from '../services/api';

interface Props {
  visible: boolean;
  exerciseName: string;
  onClose: () => void;
}

interface Section {
  type: 'subheading' | 'text' | 'bullet';
  text: string;
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/~~/g, '')
    .replace(/```/g, '')
    .replace(/`/g, '')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/\//g, '')
    .replace(/\\/g, '')
    .trim();
}

const SUBHEADING_KEYWORDS = [
  'setup', 'positioning', 'execution', 'tips', 'safety',
  'variations', 'variation', 'form', 'technique', 'breathing',
  'common mistakes', 'pro tip', 'note', 'progression', 'regression',
];

function parseGuidance(text: string): Section[] {
  const lines = text.split('\n').filter(l => l.trim());
  const sections: Section[] = [];

  for (const line of lines) {
    let clean = cleanText(line);
    if (!clean) continue;

    const lower = clean.toLowerCase();

    const isSubheading = SUBHEADING_KEYWORDS.some(kw =>
      lower.startsWith(kw) || lower.replace(':', '').trim() === kw
    ) || (clean.length < 40 && clean.endsWith(':'));

    if (isSubheading) {
      sections.push({ type: 'subheading', text: clean.replace(':', '').trim() });
    } else if (clean.startsWith('- ') || clean.startsWith('• ') || clean.startsWith('* ')) {
      sections.push({ type: 'bullet', text: clean.substring(2) });
    } else {
      sections.push({ type: 'text', text: clean });
    }
  }

  return sections;
}

export function AICoachModal({ visible, exerciseName, onClose }: Props) {
  const { theme } = useTheme();
  const [guidance, setGuidance] = useState('');
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && exerciseName) {
      setLoading(true);
      ai.coach(exerciseName)
        .then(data => {
          setGuidance(data.guidance || '');
          setTip(data.quickTip || '');
        })
        .catch(() => {
          setGuidance('AI coaching is available when connected to the backend.');
        })
        .finally(() => setLoading(false));
    }
  }, [visible, exerciseName]);

  const sections = parseGuidance(guidance);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="bulb" size={22} color={theme.colors.primary} />
              <Text style={[styles.title, { color: theme.colors.primary }]}>AI Coach</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.exerciseBadge, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
            <Ionicons name="fitness" size={16} color={theme.colors.primary} />
            <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{exerciseName}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
                Getting AI guidance...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {sections.length === 0 && guidance ? (
                <Text style={[styles.bodyText, { color: theme.colors.text }]}>{cleanText(guidance)}</Text>
              ) : (
                sections.map((s, i) => {
                  switch (s.type) {
                    case 'subheading':
                      return (
                        <View key={i} style={[styles.subheadingRow, { borderLeftColor: theme.colors.primary }]}>
                          <Text style={[styles.subheadingText, { color: theme.colors.primary }]}>
                            {s.text}
                          </Text>
                        </View>
                      );
                    case 'bullet':
                      return (
                        <View key={i} style={styles.bulletRow}>
                          <Text style={[styles.bulletDot, { color: theme.colors.primary }]}>•</Text>
                          <Text style={[styles.bulletText, { color: theme.colors.text }]}>
                            {s.text}
                          </Text>
                        </View>
                      );
                    default:
                      return (
                        <Text key={i} style={[styles.bodyText, { color: theme.colors.text }]}>
                          {s.text}
                        </Text>
                      );
                  }
                })
              )}

              {tip ? (
                <View style={[styles.tipBox, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.warning + '50' }]}>
                  <View style={styles.tipHeader}>
                    <Ionicons name="bulb-outline" size={16} color={theme.colors.warning} />
                    <Text style={[styles.tipLabel, { color: theme.colors.warning }]}>Quick Tip</Text>
                  </View>
                  <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{tip}</Text>
                </View>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  container: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40, maxHeight: '85%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  exerciseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, alignSelf: 'flex-start', marginBottom: 16,
  },
  exerciseName: { fontSize: 14, fontWeight: '600' },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },
  content: { maxHeight: 420 },
  subheadingRow: { borderLeftWidth: 3, paddingLeft: 12, marginTop: 16, marginBottom: 6 },
  subheadingText: { fontSize: 16, fontWeight: '700' },
  bodyText: { fontSize: 15, lineHeight: 22, marginBottom: 6, paddingLeft: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, paddingLeft: 4 },
  bulletDot: { fontSize: 16, marginRight: 8, marginTop: 2 },
  bulletText: { fontSize: 15, lineHeight: 21, flex: 1 },
  tipBox: { marginTop: 20, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  tipLabel: { fontSize: 14, fontWeight: '700' },
  tipText: { fontSize: 14, lineHeight: 20 },
});
