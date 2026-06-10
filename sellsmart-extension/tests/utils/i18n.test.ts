import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTranslation, detectLocale, SUPPORTED_LOCALES, type Locale } from '~/utils/i18n';

describe('getTranslation', () => {
  it('returns English translation by default', () => {
    const t = getTranslation('en');
    expect(t.appName).toBe('SellSmart');
    expect(t.calculate).toBe('Calculate Profit');
    expect(t.platformEtsy).toBe('Etsy');
  });

  it('returns Portuguese translation', () => {
    const t = getTranslation('pt');
    expect(t.appName).toBe('SellSmart');
    expect(t.calculate).toBe('Calcular Lucro');
    expect(t.costOfGoods).toBe('Custo do Produto');
  });

  it('returns Spanish translation', () => {
    const t = getTranslation('es');
    expect(t.appName).toBe('SellSmart');
    expect(t.calculate).toBe('Calcular Ganancia');
    expect(t.costOfGoods).toBe('Costo del Producto');
  });

  it('falls back to English for unsupported locale', () => {
    const t = getTranslation('fr' as Locale);
    expect(t).toEqual(getTranslation('en'));
  });

  it('all locales have the same keys', () => {
    const enKeys = Object.keys(getTranslation('en')).sort();
    for (const locale of SUPPORTED_LOCALES) {
      expect(Object.keys(getTranslation(locale)).sort()).toEqual(enKeys);
    }
  });
});

describe('detectLocale', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns "en" for English browser', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    expect(detectLocale()).toBe('en');
  });

  it('returns "pt" for Portuguese browser', () => {
    vi.stubGlobal('navigator', { language: 'pt-BR' });
    expect(detectLocale()).toBe('pt');
  });

  it('returns "es" for Spanish browser', () => {
    vi.stubGlobal('navigator', { language: 'es-MX' });
    expect(detectLocale()).toBe('es');
  });

  it('returns "en" for unsupported locale', () => {
    vi.stubGlobal('navigator', { language: 'fr-FR' });
    expect(detectLocale()).toBe('en');
  });

  it('returns "en" for Japanese browser', () => {
    vi.stubGlobal('navigator', { language: 'ja' });
    expect(detectLocale()).toBe('en');
  });
});

describe('SUPPORTED_LOCALES', () => {
  it('contains exactly en, pt, es', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'pt', 'es']);
  });
});
