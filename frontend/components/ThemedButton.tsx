import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function ThemedButton({ title, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const { theme } = useTheme();

  const bgColor = variant === 'primary'
    ? theme.colors.primary
    : variant === 'secondary'
    ? theme.colors.surfaceAlt
    : 'transparent';

  const textColor = variant === 'primary'
    ? theme.colors.background
    : variant === 'outline'
    ? theme.colors.primary
    : theme.colors.text;

  const borderStyle = variant === 'outline'
    ? { borderWidth: 1, borderColor: theme.colors.primary }
    : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: bgColor, opacity: disabled ? 0.5 : 1 },
        borderStyle,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
