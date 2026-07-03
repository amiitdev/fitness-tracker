import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemedInput } from '../../components/ThemedInput';
import { ThemedButton } from '../../components/ThemedButton';

export default function SignInScreen() {
  const { signin } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signin(email, password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>FitTrack</Text>
        <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>Your Personal Fitness Journey</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={[styles.welcome, { color: theme.colors.text }]}>Welcome Back</Text>

            <ThemedInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ThemedInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />

            <ThemedButton
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 20 },
  appName: { fontSize: 36, fontWeight: '800' },
  tagline: { fontSize: 14, marginTop: 4 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  form: { marginBottom: 24 },
  welcome: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 40, paddingHorizontal: 24 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '600' },
});
