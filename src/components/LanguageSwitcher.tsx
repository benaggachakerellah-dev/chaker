'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales, Locale, localeNames } from '@/lib/i18n/config';
import { buildLocalePath } from '@/lib/i18n/buildLocalePath';
import { Suspense } from 'react';

function LanguageSwitcherInner() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    if (!pathname) return;
    const newPath = buildLocalePath(pathname, newLocale);
    router.push(newPath);
  };

  const currentLocale = pathname?.split('/')[1] || 'ar';

  return (
    <div className="inline-flex rounded-lg border border-desert-gold/30 bg-white/10 p-1 shadow-sm backdrop-blur">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            currentLocale === loc
              ? 'bg-desert-gold text-desert-dark shadow'
              : 'text-desert-dark hover:bg-desert-gold/20'
          }`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}

export function LanguageSwitcher() {
  return (
    <Suspense fallback={<div className="w-24 h-8" />}>
      <LanguageSwitcherInner />
    </Suspense>
  );
}
