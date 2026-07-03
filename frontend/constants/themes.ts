export interface Theme {
  name: string;
  key: string;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    card: string;
    tabBar: string;
    tabBarInactive: string;
    inputBackground: string;
    headerBackground: string;
  };
}

export const themes: Record<string, Theme> = {
  dark1: {
    name: 'Midnight Black',
    key: 'dark1',
    colors: {
      background: '#0D0D0D',
      surface: '#1A1A1A',
      surfaceAlt: '#242424',
      primary: '#BB86FC',
      primaryLight: '#CFA8FF',
      secondary: '#03DAC6',
      accent: '#FF7597',
      text: '#E1E1E1',
      textSecondary: '#A0A0A0',
      textMuted: '#666666',
      border: '#2A2A2A',
      error: '#CF6679',
      success: '#4CAF50',
      warning: '#FFB74D',
      card: '#1E1E1E',
      tabBar: '#141414',
      tabBarInactive: '#555555',
      inputBackground: '#222222',
      headerBackground: '#0D0D0D',
    },
  },
  dark2: {
    name: 'Charcoal Gray',
    key: 'dark2',
    colors: {
      background: '#121212',
      surface: '#1E1E1E',
      surfaceAlt: '#2C2C2C',
      primary: '#64B5F6',
      primaryLight: '#90CAF9',
      secondary: '#81C784',
      accent: '#FFB74D',
      text: '#F0F0F0',
      textSecondary: '#B0B0B0',
      textMuted: '#707070',
      border: '#333333',
      error: '#E57373',
      success: '#66BB6A',
      warning: '#FFA726',
      card: '#252525',
      tabBar: '#1A1A1A',
      tabBarInactive: '#606060',
      inputBackground: '#282828',
      headerBackground: '#121212',
    },
  },
  dark3: {
    name: 'Deep Ocean',
    key: 'dark3',
    colors: {
      background: '#0A1628',
      surface: '#0F1F35',
      surfaceAlt: '#162A45',
      primary: '#4DD0E1',
      primaryLight: '#80DEEA',
      secondary: '#7E57C2',
      accent: '#FF8A65',
      text: '#E0E8F0',
      textSecondary: '#A0B0C8',
      textMuted: '#607080',
      border: '#1E3450',
      error: '#EF5350',
      success: '#26A69A',
      warning: '#FFB74D',
      card: '#12253D',
      tabBar: '#0C1A2E',
      tabBarInactive: '#4A5A70',
      inputBackground: '#152A42',
      headerBackground: '#0A1628',
    },
  },
  dark4: {
    name: 'Forest Night',
    key: 'dark4',
    colors: {
      background: '#0F1A0F',
      surface: '#182418',
      surfaceAlt: '#223322',
      primary: '#81C784',
      primaryLight: '#A5D6A7',
      secondary: '#A1887F',
      accent: '#EF9A9A',
      text: '#E0E8D0',
      textSecondary: '#A0B090',
      textMuted: '#607050',
      border: '#2A3A28',
      error: '#E57373',
      success: '#66BB6A',
      warning: '#FFB74D',
      card: '#1C2C1C',
      tabBar: '#121A12',
      tabBarInactive: '#4A5A40',
      inputBackground: '#1E2E1E',
      headerBackground: '#0F1A0F',
    },
  },
  dark5: {
    name: 'Royal Dark',
    key: 'dark5',
    colors: {
      background: '#1A1025',
      surface: '#251A35',
      surfaceAlt: '#302545',
      primary: '#CE93D8',
      primaryLight: '#E1BEE7',
      secondary: '#FFD54F',
      accent: '#F48FB1',
      text: '#E8DCF0',
      textSecondary: '#B8A8C8',
      textMuted: '#706080',
      border: '#352A45',
      error: '#EF9A9A',
      success: '#81C784',
      warning: '#FFB74D',
      card: '#272040',
      tabBar: '#1C1428',
      tabBarInactive: '#5A4A6A',
      inputBackground: '#2A2040',
      headerBackground: '#1A1025',
    },
  },
};

export const defaultTheme = themes.dark1;

export const themeOptions = Object.values(themes).map(t => ({
  key: t.key,
  name: t.name,
  color: t.colors.primary,
}));
