import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

console.log('[LAYOUT] Root _layout.tsx loaded');

function RootLayoutInner() {
  console.log('[LAYOUT] RootLayoutInner rendering');
  const { theme, currentThemeKey } = useTheme();

  return (
    <ErrorBoundary>
      <StatusBar style={currentThemeKey === 'dark1' ? 'light' : 'light'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  console.log('[LAYOUT] RootLayout() called');
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </AuthProvider>
  );
}
