import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

console.log('[INDEX] app/index.tsx loaded');

export default function Index() {
  console.log('[INDEX] Index() rendering');
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    console.log('[INDEX] useEffect running. loading:', loading, 'user:', !!user);
    if (loading) return;
    if (user) {
      console.log('[INDEX] User found, redirecting to /(tabs)');
      router.replace('/(tabs)');
    } else {
      console.log('[INDEX] No user, redirecting to /(auth)/sign-in');
      router.replace('/(auth)/sign-in');
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
