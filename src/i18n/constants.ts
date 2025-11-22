import type { SupportedLanguage, LanguageInfo } from './types';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'clink-user-language';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
    },
    {
        code: 'ua',
        name: 'Ukrainian',
        nativeName: 'Українська',
        flag: '🇺🇦',
        direction: 'ltr',
    },
    {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        direction: 'ltr',
    },
];

// Language detection patterns
export const BROWSER_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
    en: 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'en-CA': 'en',
    'en-AU': 'en',
    'en-NZ': 'en',
    'en-ZA': 'en',
    uk: 'ua', // Ukrainian language code
    'uk-UA': 'ua',
    ua: 'ua', // Alternative Ukrainian code
    'ua-UA': 'ua',
    fr: 'fr',
    'fr-FR': 'fr',
    'fr-CA': 'fr',
    'fr-BE': 'fr',
    'fr-CH': 'fr',
};
