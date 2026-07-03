import { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>{this.state.error.message}</Text>
            <Text style={styles.stack}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 20, paddingTop: 80 },
  title: { fontSize: 20, fontWeight: '700', color: '#CF6679', marginBottom: 12 },
  message: { fontSize: 14, color: '#E1E1E1', marginBottom: 20 },
  stack: { fontSize: 11, color: '#A0A0A0', fontFamily: 'monospace' },
});
