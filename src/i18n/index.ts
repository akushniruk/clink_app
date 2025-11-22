// Main exports
export { TranslationProvider } from './TranslationContext';
export { useTranslation, useT } from './useTranslation';

// Types
export type { SupportedLanguage, TranslationKey, LanguageInfo, TranslationContextType } from './types';

// Constants
export { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from './constants';

// Utilities
export {
    detectBrowserLanguage,
    getInitialLanguage,
    saveLanguagePreference,
    isSupportedLanguage,
    getLanguageInfo,
} from './utils';

// Translations
export { translations } from './translations';

// Production optimizations
export { getCacheStats, clearTranslationCache, preloadTranslations } from './optimizations';

// Error handling & diagnostics
export { getTranslationDiagnostics, translationErrorReporter } from './errorHandling';
