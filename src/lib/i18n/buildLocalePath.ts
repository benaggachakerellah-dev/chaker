import { locales, Locale } from './config';

export function buildLocalePath(currentPathname: string, newLocale: Locale): string {
  if (!currentPathname) return `/${newLocale}`;

  // Handle query parameters if present
  const [pathnameWithoutQuery, search = ''] = currentPathname.split('?');
  const segments = (pathnameWithoutQuery || '').split('/');

  // segments[0] is empty because path starts with /
  // segments[1] is the current locale if present
  if (locales.includes(segments[1] as Locale)) {
    segments[1] = newLocale;
  } else {
    segments.splice(1, 0, newLocale);
  }

  const newPath = segments.join('/') || `/${newLocale}`;
  return search ? `${newPath}?${search}` : newPath;
}
