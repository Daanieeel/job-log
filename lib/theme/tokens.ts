import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

/**
 * Single source of truth for color tokens, mirrored from global.css.
 * Keep these two files in sync — global.css drives NativeWind classNames,
 * this file drives native-only APIs (react-navigation theme, LinearGradient, StatusBar).
 */
export const THEME = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(240 10% 8%)',
    card: 'hsl(240 20% 99%)',
    cardForeground: 'hsl(240 10% 8%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(240 10% 8%)',
    primary: 'hsl(258 90% 66%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(240 5% 96%)',
    secondaryForeground: 'hsl(240 10% 8%)',
    muted: 'hsl(240 5% 96%)',
    mutedForeground: 'hsl(240 4% 46%)',
    accent: 'hsl(258 90% 66%)',
    accentForeground: 'hsl(0 0% 100%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    border: 'hsl(240 6% 90%)',
    input: 'hsl(240 6% 90%)',
    ring: 'hsl(258 90% 66%)',
    radius: '1.25rem',
  },
  dark: {
    background: 'hsl(240 10% 4%)',
    foreground: 'hsl(0 0% 98%)',
    card: 'hsl(240 8% 8%)',
    cardForeground: 'hsl(0 0% 98%)',
    popover: 'hsl(240 8% 7%)',
    popoverForeground: 'hsl(0 0% 98%)',
    primary: 'hsl(258 92% 70%)',
    primaryForeground: 'hsl(240 10% 6%)',
    secondary: 'hsl(240 6% 14%)',
    secondaryForeground: 'hsl(0 0% 98%)',
    muted: 'hsl(240 6% 14%)',
    mutedForeground: 'hsl(240 5% 65%)',
    accent: 'hsl(258 92% 70%)',
    accentForeground: 'hsl(240 10% 6%)',
    destructive: 'hsl(0 70.9% 59.4%)',
    border: 'hsl(240 6% 16%)',
    input: 'hsl(240 6% 16%)',
    ring: 'hsl(258 92% 70%)',
    radius: '1.25rem',
  },
} as const;

export type ColorScheme = keyof typeof THEME;

export const NAV_THEME: Record<ColorScheme, Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};

/**
 * The four brand/gradient hues, as comma-separated `h, s%, l%` triplets (legacy hsla() syntax,
 * for reliable RN color parsing). Violet/Purple is the brand accent (primary/accent tokens above);
 * all four are blended in the hero glow gradient.
 */
export const GLOW_HUES = {
  light: {
    violet: '258, 90%, 66%',
    cobalt: '221, 83%, 53%',
    amber: '32, 95%, 58%',
    cyan: '190, 90%, 58%',
  },
  dark: {
    violet: '258, 92%, 70%',
    cobalt: '221, 91%, 66%',
    amber: '36, 96%, 64%',
    cyan: '190, 90%, 66%',
  },
} as const;

export type GlowHue = keyof (typeof GLOW_HUES)['light'];

/** Plain (alpha-less) color for a glow hue — pair with SVG's `stopOpacity` for the fade. */
export function glowHueColor(scheme: ColorScheme, hue: GlowHue): string {
  return `hsl(${GLOW_HUES[scheme][hue]})`;
}

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;
