import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemedInput } from '../../components/ThemedInput';
import { ThemedButton } from '../../components/ThemedButton';

export default function SignUpScreen() {
  const { signup } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>FitTrack</Text>
        <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>Start Your Transformation</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={[styles.welcome, { color: theme.colors.text }]}>Create Account</Text>

            <ThemedInput
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />

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
              placeholder="At least 6 characters"
              secureTextEntry
            />

            <ThemedButton
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Sign In</Text>
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
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 40, paddingHorizontal: 24 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '600' },
});
