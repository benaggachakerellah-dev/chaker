import arDictionary from '@/locales/ar.json';
import frDictionary from '@/locales/fr.json';
import enDictionary from '@/locales/en.json';
import { Locale } from './config';

const loadedDictionaries: Record<Locale, any> = {
  ar: arDictionary,
  fr: frDictionary,
  en: enDictionary,
};

export function t(key: string, locale: Locale = 'ar'): string {
  const dictionary = loadedDictionaries[locale] || loadedDictionaries.ar;
  const keys = key.split('.');

  let current: any = dictionary;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to Arabic ('ar') if key not found in current locale
      let fallback: any = loadedDictionaries.ar;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return key;
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }

  return typeof current === 'string' ? current : key;
}
