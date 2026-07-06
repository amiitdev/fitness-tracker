import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemedButton } from '../../components/ThemedButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../../services/notificationService';

export default function ProfileScreen() {
  const { theme, currentThemeKey, setTheme, themeOptions } = useTheme();
  const { user, signout } = useAuth();
  const router = useRouter();

  const [workoutReminder, setWorkoutReminder] = useState('off');
  const [waterReminder, setWaterReminder] = useState('off');

  // Load saved settings
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const savedWorkout = await AsyncStorage.getItem('workout_reminder_pref');
        const savedWater = await AsyncStorage.getItem('water_reminder_pref');
        if (savedWorkout) setWorkoutReminder(savedWorkout);
        if (savedWater) setWaterReminder(savedWater);
      } catch (err) {
        console.log('Error loading notification settings:', err);
      }
    };
    loadNotificationSettings();
  }, []);

  const handleWorkoutReminderChange = async (key: string) => {
    setWorkoutReminder(key);
    try {
      await AsyncStorage.setItem('workout_reminder_pref', key);
      
      if (!NotificationService.isAvailable()) {
        Alert.alert(
          'Expo Go Limitation',
          'Local notifications are not supported in the Expo Go client app. Your choice has been saved and will work automatically when you run the built APK.'
        );
        return;
      }

      if (key === 'off') {
        await NotificationService.cancelWorkoutReminders();
        Alert.alert('Notifications', 'Daily workout reminders disabled.');
      } else {
        const isGranted = await NotificationService.requestPermissions();
        if (isGranted) {
          const hour = key === 'morning' ? 8 : 18;
          const min = 0;
          await NotificationService.scheduleDailyWorkoutReminder(hour, min);
          Alert.alert(
            'Notifications',
            `Daily workout reminder scheduled for ${key === 'morning' ? '8:00 AM' : '6:00 PM'}.`
          );
        } else {
          Alert.alert('Permission Denied', 'Please enable notifications in your phone settings to receive reminders.');
          setWorkoutReminder('off');
          await AsyncStorage.setItem('workout_reminder_pref', 'off');
        }
      }
    } catch (err) {
      console.log('Error setting workout reminder:', err);
    }
  };

  const handleWaterReminderChange = async (key: string) => {
    setWaterReminder(key);
    try {
      await AsyncStorage.setItem('water_reminder_pref', key);
      
      if (!NotificationService.isAvailable()) {
        Alert.alert(
          'Expo Go Limitation',
          'Local notifications are not supported in the Expo Go client app. Your choice has been saved and will work automatically when you run the built APK.'
        );
        return;
      }

      if (key === 'off') {
        await NotificationService.cancelWaterReminders();
        Alert.alert('Notifications', 'Water reminders disabled.');
      } else {
        const isGranted = await NotificationService.requestPermissions();
        if (isGranted) {
          const minutes = key === '1h' ? 60 : 120;
          await NotificationService.scheduleWaterReminder(minutes);
          Alert.alert('Notifications', `Water reminder scheduled every ${key === '1h' ? 'hour' : '2 hours'}.`);
        } else {
          Alert.alert('Permission Denied', 'Please enable notifications in your phone settings to receive reminders.');
          setWaterReminder('off');
          await AsyncStorage.setItem('water_reminder_pref', 'off');
        }
      }
    } catch (err) {
      console.log('Error setting water reminder:', err);
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.scheduleTestNotification();
      Alert.alert(
        'Test Scheduled',
        'Test notification will arrive in 5 seconds. You can lock your phone or close the app to test!'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to trigger test notification');
    }
  };

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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
          Set up reminders for your fitness journey
        </Text>

        {/* Workout Reminder Option */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Workout Reminders</Text>
        <View style={styles.optionRow}>
          {[
            { key: 'off', label: 'Off' },
            { key: 'morning', label: 'Morning (8am)' },
            { key: 'evening', label: 'Evening (6pm)' },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionButton,
                {
                  backgroundColor: workoutReminder === opt.key ? theme.colors.primary + '20' : theme.colors.surfaceAlt,
                  borderColor: workoutReminder === opt.key ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => handleWorkoutReminderChange(opt.key)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  { color: workoutReminder === opt.key ? theme.colors.primary : theme.colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Water Reminder Option */}
        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 16 }]}>Water Reminders</Text>
        <View style={styles.optionRow}>
          {[
            { key: 'off', label: 'Off' },
            { key: '1h', label: 'Every 1 Hr' },
            { key: '2h', label: 'Every 2 Hrs' },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionButton,
                {
                  backgroundColor: waterReminder === opt.key ? theme.colors.secondary + '20' : theme.colors.surfaceAlt,
                  borderColor: waterReminder === opt.key ? theme.colors.secondary : theme.colors.border,
                },
              ]}
              onPress={() => handleWaterReminderChange(opt.key)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  { color: waterReminder === opt.key ? theme.colors.secondary : theme.colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Test Notification Button */}
        <View style={{ marginTop: 20 }}>
          <ThemedButton
            title="Test Notifications (5s Delay)"
            onPress={handleTestNotification}
            variant="outline"
          />
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
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  optionButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  optionButtonText: { fontSize: 12, fontWeight: '600' },
});
