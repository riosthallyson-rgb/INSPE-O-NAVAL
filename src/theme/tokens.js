export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const radii = {
  control: 12,
  card: 16,
  elevated: 20,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, lineHeight: 36, fontWeight: '800' },
  screenTitle: { fontSize: 24, lineHeight: 32, fontWeight: '800' },
  sectionTitle: { fontSize: 18, lineHeight: 25, fontWeight: '700' },
  cardTitle: { fontSize: 16, lineHeight: 23, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  label: { fontSize: 12, lineHeight: 17, fontWeight: '700' },
};

export const lightColors = {
  primary: '#174A7E',
  action: '#1769AA',
  background: '#EEF3F7',
  surface: '#FFFFFF',
  surfaceElevated: '#F7FAFC',
  text: '#102A43',
  textMuted: '#526675',
  border: '#CBD8E2',
  conform: '#197149',
  nonConform: '#B42318',
  pending: '#956000',
  notApplicable: '#526675',
  infoSurface: '#E8F2FC',
  warningSurface: '#FFF4DE',
  dangerSurface: '#FDECEA',
  onAction: '#FFFFFF',
};

export const darkColors = {
  primary: '#8BC6FF',
  action: '#5DB3F7',
  background: '#07131D',
  surface: '#102635',
  surfaceElevated: '#173447',
  text: '#F4F8FB',
  textMuted: '#B7CAD7',
  border: '#365568',
  conform: '#5BC991',
  nonConform: '#FF8B82',
  pending: '#F1BD61',
  notApplicable: '#B7CAD7',
  infoSurface: '#173A55',
  warningSurface: '#493817',
  dangerSurface: '#4B2525',
  onAction: '#07131D',
};

export const getTheme = (darkMode = false) => ({
  colors: darkMode ? darkColors : lightColors,
  spacing,
  radii,
  typography,
});

export const motion = {
  quick: 160,
  standard: 220,
};
