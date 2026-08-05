// Single source of truth for color and type. No color may be hardcoded
// anywhere else in the app — every hex/rgba value lives here.
export const theme = {
  bg: '#0F1115',

  // Glass surface — translucent orange-on-dark. Every card/input/button
  // panel uses this instead of a flat color so the whole app reads as
  // tinted frosted glass over `bg`, not solid gray boxes.
  surface: 'rgba(255,138,76,0.10)',

  // Orange ramp — light to deep
  accentLight: '#FFB088',
  accent: '#FF8A4C',
  accentDeep: '#F2621B',

  // Transparent orange tints for glows, fills, inactive states
  accentGlass08: 'rgba(255,138,76,0.08)',
  accentGlass16: 'rgba(255,138,76,0.16)',
  accentGlass32: 'rgba(255,138,76,0.32)',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.40)',

  // Glass edge — orange-tinted border so every panel outline carries the
  // brand hue instead of a neutral gray hairline.
  border: 'rgba(255,138,76,0.22)',

  // Nav bar glass — lighter than `surface` so the tab bar sits visibly
  // "above" the page content instead of blending into the cards.
  navBar: 'rgba(255,176,136,0.18)',
  navBarBorder: 'rgba(255,176,136,0.30)',

  // Modal backdrop scrim — black+alpha neutral, not a brand hue
  overlay: 'rgba(0,0,0,0.7)',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
}

// Named type scale — pure metrics, no color. Color is chosen per call
// site from theme.textPrimary/Secondary/Muted/accent depending on
// context (e.g. `caption` defaults to textMuted, but a unit label next
// to a `metric` value uses textSecondary instead).
export const typography = {
  display: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3 },
  heading: { fontSize: 19, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  caption: { fontSize: 12, fontWeight: '400' },
  metric: { fontSize: 40, fontWeight: '700', letterSpacing: -1 },
  // Tiny all-caps section headers ("THIS WEEK", "PERSONAL RECORDS", ...)
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2 },
} as const

// Deprecated — retained only until every screen has migrated to
// `typography`. Do not use in new code.
export const fontSize = {
  xs: 13,
  sm: 15,
  md: 18,
  lg: 19,
  xl: 22,
  xxl: 28,
  xxxl: 36,
}

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const
