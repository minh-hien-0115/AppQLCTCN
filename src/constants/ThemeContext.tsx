import React, { createContext, useContext, useState } from 'react';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  Theme as NavigationThemeType,
} from '@react-navigation/native';

type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  colors: {
    background: string;
    text: string;
    tabBarBackground: string;
    tabBarIcon: string;
  };
  toggleTheme: () => void;
  navigationTheme: NavigationThemeType;
}

const LightColors = {
  background: '#fff',
  text: '#000',
  tabBarBackground: '#fff',
  tabBarIcon: '#000',
};

const DarkColors = {
  background: '#121212',
  text: '#fff',
  tabBarBackground: '#1e1e1e',
  tabBarIcon: '#fff',
};

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  colors: LightColors,
  toggleTheme: () => {},
  navigationTheme: NavigationLightTheme,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('light');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'light' ? LightColors : DarkColors;
  const navigationTheme = theme === 'light' ? NavigationLightTheme : NavigationDarkTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, navigationTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);