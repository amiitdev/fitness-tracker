import { View, type ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props extends ViewProps {
  surface?: boolean;
  alt?: boolean;
}

export function ThemeView({ style, surface, alt, ...props }: Props) {
  const { theme } = useTheme();
  const bg = surface
    ? theme.colors.surface
    : alt
    ? theme.colors.surfaceAlt
    : theme.colors.background;

  return <View style={[{ backgroundColor: bg }, style]} {...props} />;
}
