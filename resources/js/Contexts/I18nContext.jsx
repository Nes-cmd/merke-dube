import React, { createContext, useContext, useState, useEffect } from 'react';
import enLocale from '../locales/en.json';
import amLocale from '../locales/am.json';

const locales = {
  en: enLocale,
  am: amLocale
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(localStorage.getItem('locale') || 'en');
  
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);
  
  const t = (key) => {
    const keys = key.split('.');
    let value = locales[locale];
    
    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }
    
    return value || key;
  };
  
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
} 