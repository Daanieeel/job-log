import { NAV_THEME } from '@/lib/theme/tokens';
import { useThemeStore } from '@/lib/stores/themeStore';
import * as SystemUI from 'expo-system-ui';
import { ThemeProvider as NavigationThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';

/**
 * Applies the persisted theme preference (system/light/dark) to NativeWind,
 * react-navigation chrome, the status bar, and the root window background —
 * all in one place so switching is instant with no unstyled flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useThemeStore((state) => state.preference);
  const { colorScheme, setColorScheme } = useColorScheme();

  React.useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  const scheme = colorScheme ?? 'light';

  React.useEffect(() => {
    SystemUI.setBackgroundColorAsync(NAV_THEME[scheme].colors.background);
  }, [scheme]);

  return (
    <NavigationThemeProvider value={NAV_THEME[scheme]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} animated />
      {children}
    </NavigationThemeProvider>
  );
}
