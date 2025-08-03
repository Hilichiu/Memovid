import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Language } from '../types';
import translations from '../i18n/translations.json';

interface TranslationContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextValue>({
  language: 'zh-TW',
  setLanguage: () => { },
  t: (key: string) => key,
});

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'zh-TW'; // Default to zh-TW
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[language][key as keyof typeof translations['en']] || key;

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
    }

    return text;
  };

  // wrap children in context provider without JSX
  return React.createElement(
    TranslationContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useTranslation = () => {
  return useContext(TranslationContext);
};