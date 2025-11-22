import type { SupportedLanguage, TranslationKey } from '../types';

// Import English synchronously as it's the default fallback
import { en } from './en';

// Cache for dynamically loaded translations
const translationCache = new Map<SupportedLanguage, TranslationKey>();

// Set English as default in cache
translationCache.set('en', en);

// Parallel loading of all language files
const loadAllTranslationsInParallel = async (): Promise<void> => {
    try {
        // Load ua and fr in parallel using Promise.all
        const [uaModule, frModule] = await Promise.all([import('./ua'), import('./fr')]);

        // Cache the loaded translations
        translationCache.set('ua', uaModule.ua);
        translationCache.set('fr', frModule.fr);

        console.log('All translations loaded in parallel');
    } catch (error) {
        console.error('Failed to load some translations:', error);
    }
};

// Start parallel loading immediately
loadAllTranslationsInParallel();

// Dynamic translation getter with fallback
const getTranslation = (language: SupportedLanguage): TranslationKey => {
    return translationCache.get(language) || en;
};

// Legacy synchronous export for backward compatibility
export const translations: Record<SupportedLanguage, TranslationKey> = new Proxy(
    {} as Record<SupportedLanguage, TranslationKey>,
    {
        get(_target, prop: string | symbol) {
            if (typeof prop === 'string' && ['en', 'ua', 'fr'].includes(prop)) {
                return getTranslation(prop as SupportedLanguage);
            }
            return undefined;
        },
    },
);

// Export individual translations for direct access
export { en };
export const ua = () => translationCache.get('ua') || en;
export const fr = () => translationCache.get('fr') || en;
