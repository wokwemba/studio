'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export const supportedLocales = ['en', 'es', 'fr'];
export const defaultLocale = 'en';

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(defaultLocale);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    const browserLocale = navigator.language.split('-')[0];
    
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else if (supportedLocales.includes(browserLocale)) {
      setLocaleState(browserLocale);
    }
  }, []);

  const setLocale = (newLocale: string) => {
    if (supportedLocales.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  };
  
  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
