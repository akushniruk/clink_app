import { useContext } from 'preact/hooks';
import { TranslationContext } from './TranslationContext';
import type { TranslationContextType } from './types';

/**
 * Hook to access translation functionality
 *
 * @returns Translation context with current language, t function, and language management
 * @throws Error if used outside TranslationProvider
 */
export function useTranslation(): TranslationContextType {
    const context = useContext(TranslationContext);

    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }

    return context;
}

/**
 * Simplified hook that just returns the translation function
 *
 * @returns Translation function
 */
export function useT() {
    const { t } = useTranslation();
    return t;
}
