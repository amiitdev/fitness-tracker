import { Platform } from 'react-native';

// Safe dynamic import to prevent crashing inside Expo Go
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.log('[NotificationService] expo-notifications package not supported in this client (e.g. Expo Go)');
}

// Configure how notifications are handled when the app is open (in foreground)
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    } as any),
  });
}

export const NotificationService = {
  /**
   * Checks if notification support is available in the current environment
   */
  isAvailable(): boolean {
    return !!Notifications;
  },

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web' || !Notifications) return false;
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (err) {
      console.log('Error requesting notification permissions:', err);
      return false;
    }
  },

  /**
   * Checks if notification permissions are already granted
   */
  async hasPermissions(): Promise<boolean> {
    if (Platform.OS === 'web' || !Notifications) return false;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.log('Error checking notification permissions:', err);
      return false;
    }
  },

  /**
   * Schedules a test notification to fire in 5 seconds
   */
  async scheduleTestNotification(): Promise<string> {
    if (!Notifications) {
      throw new Error(
        'Notifications are not supported in Expo Go. Please run the local APK build and install it on your device to test this feature.'
      );
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "💪 FitTrack Notification Test!",
        body: "Your local notifications are set up and working perfectly!",
        sound: true,
      },
      trigger: {
        seconds: 5,
      } as any,
    });
  },

  /**
   * Schedules a daily reminder to workout
   */
  async scheduleDailyWorkoutReminder(hour: number, minute: number): Promise<string | null> {
    if (!Notifications) return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    // Cancel existing workout reminders to prevent duplicates
    await this.cancelWorkoutReminders();

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Workout Time! 🏋️‍♂️",
        body: "Time to log your daily activity and hit your fitness goals!",
        sound: true,
        data: { type: 'workout_reminder' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });
  },

  /**
   * Cancels all scheduled daily workout reminders
   */
  async cancelWorkoutReminders(): Promise<void> {
    if (!Notifications) return;

    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.content.data?.type === 'workout_reminder') {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch (err) {
      console.log('Error cancelling workout reminders:', err);
    }
  },

  /**
   * Schedules a recurring reminder to drink water
   */
  async scheduleWaterReminder(intervalMinutes: number): Promise<string | null> {
    if (!Notifications) return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    // Cancel existing water reminders
    await this.cancelWaterReminders();

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hydration Check! 💧",
        body: "Remember to drink a glass of water to stay hydrated and active!",
        sound: true,
        data: { type: 'water_reminder' },
      },
      trigger: {
        seconds: intervalMinutes * 60,
        repeats: true,
      } as any,
    });
  },

  /**
   * Cancels all scheduled water reminders
   */
  async cancelWaterReminders(): Promise<void> {
    if (!Notifications) return;

    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.content.data?.type === 'water_reminder') {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch (err) {
      console.log('Error cancelling water reminders:', err);
    }
  },

  /**
   * Cancels all scheduled notifications for the app
   */
  async cancelAll(): Promise<void> {
    if (!Notifications) return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.log('Error cancelling all notifications:', err);
    }
  }
};
