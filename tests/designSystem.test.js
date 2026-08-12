import { darkColors, getTheme, lightColors, spacing, typography } from '../src/theme/tokens';

describe('design system', () => {
  test('usa uma grade de espaçamento crescente baseada em quatro pontos', () => {
    expect(Object.values(spacing)).toEqual([2, 4, 8, 12, 16, 20, 24, 32, 40]);
  });

  test('não usa texto crítico abaixo de 12 pontos', () => {
    Object.values(typography).forEach((textStyle) => {
      expect(textStyle.fontSize).toBeGreaterThanOrEqual(12);
    });
  });

  test('fornece temas distintos e completos', () => {
    expect(getTheme(false).colors).toBe(lightColors);
    expect(getTheme(true).colors).toBe(darkColors);
    expect(Object.keys(darkColors)).toEqual(Object.keys(lightColors));
  });
});
