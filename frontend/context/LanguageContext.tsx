'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import esCalls from '../dictionaries/es.json';
import enCalls from '../dictionaries/en.json';

type Locale = 'es' | 'en';
type Dictionary = typeof esCalls;

// Recursively iterate types to allow nested keys
type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<Dictionary>;

interface LanguageContextProps {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: String) => string;
}

const dictionaries: Record<Locale, Dictionary> = {
    es: esCalls,
    en: enCalls,
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>('es');

    // Load from localStorage if available
    useEffect(() => {
        const saved = localStorage.getItem('locale');
        if (saved === 'en' || saved === 'es') {
            setLocale(saved);
        }
    }, []);

    const changeLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: String): string => {
        const keys = key.split('.');
        let current: any = dictionaries[locale];

        for (const k of keys) {
            if (current[k] === undefined) {
                console.warn(`Translation key not found: ${key}`);
                return key.toString();
            }
            current = current[k];
        }

        return current as string;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
