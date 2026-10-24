import 'server-only';
import { Locale } from './config';

const dictionaries: Record<Locale, () => Promise<any>> = {
  ar: () => import('@/locales/ar.json').then((module) => module.default),
  fr: () => import('@/locales/fr.json').then((module) => module.default),
  en: () => import('@/locales/en.json').then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  const loadFn = dictionaries[locale] || dictionaries.ar;
  return loadFn();
}
