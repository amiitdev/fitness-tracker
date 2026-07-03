import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemedButton } from '../../components/ThemedButton';

export default function ProfileScreen() {
  const { theme, currentThemeKey, setTheme, themeOptions } = useTheme();
  const { user, signout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signout();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {(user?.name || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.colors.text }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.email, { color: theme.colors.textMuted }]}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Theme</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
          Choose from 5 dark themes
        </Text>
        <View style={styles.themeGrid}>
          {themeOptions.map(opt => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setTheme(opt.key)}
              style={[
                styles.themeCard,
                {
                  backgroundColor: opt.color + '20',
                  borderColor: currentThemeKey === opt.key ? opt.color : theme.colors.border,
                  borderWidth: currentThemeKey === opt.key ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.themeDot, { backgroundColor: opt.color }]} />
              <Text style={[styles.themeName, { color: theme.colors.text }]}>{opt.name}</Text>
              {currentThemeKey === opt.key && (
                <Text style={[styles.themeActive, { color: opt.color }]}>Active</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
        <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Member Since</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {user?._id ? 'Active' : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.signOutSection}>
        <ThemedButton
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
          FitTrack v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: 12 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: {
    width: '47%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  themeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  themeName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  themeActive: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  signOutSection: { paddingHorizontal: 20, marginTop: 12 },
  footer: { alignItems: 'center', paddingVertical: 30 },
  footerText: { fontSize: 12 },
});
