export const palette = {
  background: '#0E1018',
  surface: '#171C2A',
  surfaceAlt: '#1F2638',
  primary: '#7C4DFF',
  primaryAlt: '#A86BFF',
  secondary: '#00D0FF',
  accent: '#FFB92E',
  success: '#4CAF50',
  danger: '#FF5252',
  text: '#F4F6FA',
  textMuted: '#A0A6BA',
  border: '#272E42',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
    color: palette.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    color: palette.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: palette.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: palette.textMuted,
  },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
};

export const gradients = {
  primary: ['#7C4DFF', '#5C6CFF'],
  surface: ['#1B2233', '#111726'],
};

export const pressScale = {
  activeScale: 0.96,
  tension: 150,
  friction: 8,
};
