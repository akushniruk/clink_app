import type { SupportedLanguage, TranslationKey } from './types';

/**
 * Production-grade translation optimizations
 */

// Translation cache for better performance
const translationCache = new Map<string, string>();

// Cache for parsed interpolations
const interpolationCache = new Map<string, RegExp>();

/**
 * Optimized interpolation function with caching
 */
export function optimizedInterpolate(template: string, params: Record<string, string | number> = {}): string {
    if (!params || Object.keys(params).length === 0) {
        return template;
    }

    const cacheKey = template;
    let regex = interpolationCache.get(cacheKey);

    if (!regex) {
        regex = /\{(\w+)\}/g;
        interpolationCache.set(cacheKey, regex);
    }

    return template.replace(regex, (match, key) => {
        const value = params[key];
        return value !== undefined ? String(value) : match;
    });
}

/**
 * Cached translation getter with fallback
 */
export function getCachedTranslation(
    translations: Record<SupportedLanguage, TranslationKey>,
    currentLanguage: SupportedLanguage,
    key: string,
): string | undefined {
    const cacheKey = `${currentLanguage}:${key}`;

    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    const translation = getNestedTranslation(translations[currentLanguage], key);

    if (typeof translation === 'string') {
        translationCache.set(cacheKey, translation);
        return translation;
    }

    // Fallback to English
    if (currentLanguage !== 'en') {
        const englishTranslation = getNestedTranslation(translations.en, key);
        if (typeof englishTranslation === 'string') {
            translationCache.set(cacheKey, englishTranslation);
            return englishTranslation;
        }
    }

    return undefined;
}

/**
 * Optimized nested property getter
 */
function getNestedTranslation(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }

    return current;
}

/**
 * Clear translation cache (useful for language switching)
 */
export function clearTranslationCache(): void {
    translationCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
    return {
        translationCacheSize: translationCache.size,
        interpolationCacheSize: interpolationCache.size,
        memoryUsage: {
            translations: translationCache.size * 50, // Rough estimate in bytes
            interpolations: interpolationCache.size * 100,
        },
    };
}

/**
 * Preload translations for better performance
 */
export function preloadTranslations(
    translations: Record<SupportedLanguage, TranslationKey>,
    language: SupportedLanguage,
    keys: string[],
): void {
    keys.forEach((key) => {
        const translation = getCachedTranslation(translations, language, key);
        if (translation) {
            // Translation is now cached
        }
    });
}

/**
 * Batch translation getter for better performance
 */
export function getBatchTranslations(
    translations: Record<SupportedLanguage, TranslationKey>,
    currentLanguage: SupportedLanguage,
    keys: string[],
): Record<string, string> {
    const result: Record<string, string> = {};

    keys.forEach((key) => {
        const translation = getCachedTranslation(translations, currentLanguage, key);
        if (translation) {
            result[key] = translation;
        }
    });

    return result;
}
