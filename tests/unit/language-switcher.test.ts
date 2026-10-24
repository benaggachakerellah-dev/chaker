import { describe, it, expect } from 'vitest';
import { buildLocalePath } from '@/lib/i18n/buildLocalePath';

describe('LanguageSwitcher / buildLocalePath utility', () => {
  it('switches /ar/catalog to fr produces /fr/catalog', () => {
    expect(buildLocalePath('/ar/catalog', 'fr')).toBe('/fr/catalog');
  });

  it('switches /fr to ar produces /ar', () => {
    expect(buildLocalePath('/fr', 'ar')).toBe('/ar');
  });

  it('preserves nested paths and search params when switching locales', () => {
    expect(buildLocalePath('/ar/product/123?x=1', 'en')).toBe('/en/product/123?x=1');
  });
});
