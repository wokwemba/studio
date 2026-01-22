'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/context/LocaleContext';

// This is a simplified translation hook. In a real app, you'd use a library like next-intl.
export function useTranslation() {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadTranslations() {
      try {
        const module = await import(`@/locales/${locale}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Could not load translations for locale: ${locale}`, error);
        // Fallback to English
        const module = await import(`@/locales/en.json`);
        setTranslations(module.default);
      }
    }
    loadTranslations();
  }, [locale]);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return { t, locale };
}
