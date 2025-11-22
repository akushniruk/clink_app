import type { SupportedLanguage } from './types';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, BROWSER_LANGUAGE_MAP, SUPPORTED_LANGUAGES } from './constants';

/**
 * Detects user's preferred language from browser settings with enhanced detection
 */
export function detectBrowserLanguage(): SupportedLanguage {
    try {
        // Get all available browser language preferences
        const browserLanguages = [
            // Primary browser language
            navigator.language,
            // All browser languages in order of preference
            ...(navigator.languages || []),
            // System language (fallback)
            ...(navigator.language ? [navigator.language] : []),
        ].filter(Boolean);

        // Detected browser languages

        for (const browserLang of browserLanguages) {
            const normalizedLang = browserLang.toLowerCase();

            // Direct match (exact locale)
            if (BROWSER_LANGUAGE_MAP[normalizedLang]) {
                // Language matched (exact)
                return BROWSER_LANGUAGE_MAP[normalizedLang];
            }

            // Case-insensitive direct match
            const exactMatch = Object.keys(BROWSER_LANGUAGE_MAP).find((key) => key.toLowerCase() === normalizedLang);
            if (exactMatch) {
                // Language matched (case-insensitive)
                return BROWSER_LANGUAGE_MAP[exactMatch];
            }

            // Language code only (e.g., 'en' from 'en-US')
            const langCode = normalizedLang.split('-')[0];
            if (BROWSER_LANGUAGE_MAP[langCode]) {
                // Language matched (base code)
                return BROWSER_LANGUAGE_MAP[langCode];
            }

            // Special Ukrainian detection (uk vs ua)
            if (langCode === 'uk' || langCode === 'ua') {
                // Ukrainian language detected
                return 'ua';
            }
        }

        // No language match found, using default
    } catch (error) {
        // Failed to detect browser language
    }

    return DEFAULT_LANGUAGE;
}

/**
 * Gets saved language from localStorage or detects browser language
 * Prioritizes device language detection over saved preferences for better UX
 */
export function getInitialLanguage(): SupportedLanguage {
    try {
        // First, always detect the browser/device language
        const deviceLanguage = detectBrowserLanguage();

        // Check if there's a saved language preference
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;

        // If user has a saved preference AND it's different from device language,
        // respect their choice, otherwise use device language
        if (savedLanguage && SUPPORTED_LANGUAGES.some((lang) => lang.code === savedLanguage)) {
            // Saved language found

            // If device language changed or it's first time, prefer device language
            if (deviceLanguage !== DEFAULT_LANGUAGE && deviceLanguage !== savedLanguage) {
                // Using device language over saved language
                return deviceLanguage;
            }

            // Using saved language
            return savedLanguage;
        }

        // No saved language, using device language
        return deviceLanguage;
    } catch (error) {
        // Failed to get initial language
        return detectBrowserLanguage();
    }
}

/**
 * Saves language preference to localStorage
 */
export function saveLanguagePreference(language: SupportedLanguage): void {
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
        // Failed to save language preference
    }
}

/**
 * Simple interpolation function for translation strings
 * Usage: interpolate("Hello {name}!", { name: "World" }) => "Hello World!"
 */
export function interpolate(template: string, params: Record<string, string | number> = {}): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        const value = params[key];
        return value !== undefined ? String(value) : match;
    });
}

/**
 * Gets nested property from object using dot notation
 * Usage: getNestedProperty(obj, "a.b.c") => obj.a.b.c
 */
export function getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

/**
 * Validates if a language code is supported
 */
export function isSupportedLanguage(language: string): language is SupportedLanguage {
    return SUPPORTED_LANGUAGES.some((lang) => lang.code === language);
}

/**
 * Gets language info by code
 */
export function getLanguageInfo(code: SupportedLanguage) {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Updates document language attribute for accessibility
 */
export function updateDocumentLanguage(language: SupportedLanguage): void {
    try {
        document.documentElement.lang = language;

        // Update direction if needed (for future RTL support)
        const languageInfo = getLanguageInfo(language);
        if (languageInfo) {
            document.documentElement.dir = languageInfo.direction;
        }
    } catch (error) {
        // Failed to update document language
    }
}
