import { Text, type TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props extends TextProps {
  secondary?: boolean;
  muted?: boolean;
}

export function ThemeText({ style, secondary, muted, ...props }: Props) {
  const { theme } = useTheme();
  const color = muted
    ? theme.colors.textMuted
    : secondary
    ? theme.colors.textSecondary
    : theme.colors.text;

  return <Text style={[{ color }, style]} {...props} />;
}
