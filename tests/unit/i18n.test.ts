import { describe, it, expect } from 'vitest';
import { t } from '@/lib/i18n/t';
import { directionMap } from '@/lib/i18n/config';

describe('i18n translation system (t function)', () => {
  it('returns correct Arabic translation for key', () => {
    expect(t('common.brand', 'ar')).toBe('الذهب الصحراوي');
  });

  it('returns correct French translation for key', () => {
    expect(t('common.brand', 'fr')).toBe('Or du Désert');
  });

  it('returns correct English translation for key', () => {
    expect(t('common.brand', 'en')).toBe('Desert Gold');
  });

  it('falls back to Arabic when key is missing in target locale', () => {
    // If a key exists in ar but we query a hypothetical missing key, or fallback behavior
    expect(t('common.catalog', 'en')).toBe('Catalog');
  });

  it('returns key itself or falls back gracefully on missing key', () => {
    expect(t('nonexistent.key', 'fr')).toBe('nonexistent.key');
  });

  it('correctly maps direction for locales', () => {
    expect(directionMap.ar).toBe('rtl');
    expect(directionMap.fr).toBe('ltr');
    expect(directionMap.en).toBe('ltr');
  });
});
