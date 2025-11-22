import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { SupportedLanguage, TranslationContextType, TranslationKey } from './types';
import { translations } from './translations';
import { SUPPORTED_LANGUAGES } from './constants';
import { getInitialLanguage, saveLanguagePreference, updateDocumentLanguage } from './utils';
import {
    getCachedTranslation,
    optimizedInterpolate,
    clearTranslationCache,
    preloadTranslations,
} from './optimizations';
import {
    safeTranslate,
    safeLanguageDetection,
    safeStorageOperation,
    validateTranslationParams,
    translationErrorReporter,
} from './errorHandling';

export const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
    children: ComponentChildren;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
    const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize language on mount with enhanced error handling
        const initLanguage = async () => {
            try {
                const detectedLanguage = safeLanguageDetection(() => getInitialLanguage());
                setCurrentLanguage(detectedLanguage);
                updateDocumentLanguage(detectedLanguage);

                // Preload common translations for better performance
                const commonKeys = [
                    'loading',
                    'home.title',
                    'home.subtitle',
                    'onboarding.welcome.title',
                    'skip',
                    'tapToContinue',
                ];
                preloadTranslations(translations, detectedLanguage, commonKeys);
            } catch (error) {
                translationErrorReporter.reportError({
                    type: 'DETECTION_ERROR',
                    message: `Language initialization failed: ${error}`,
                });

                // Fallback to English
                setCurrentLanguage('en');
                updateDocumentLanguage('en');
            } finally {
                setIsLoading(false);
            }
        };

        initLanguage();
    }, []);

    const setLanguage = (language: SupportedLanguage) => {
        try {
            // Clear cache when switching languages for fresh translations
            clearTranslationCache();

            setCurrentLanguage(language);

            safeStorageOperation(() => saveLanguagePreference(language), undefined, 'write');

            updateDocumentLanguage(language);

            // Preload translations for new language
            const commonKeys = [
                'home.title',
                'home.subtitle',
                'home.buttons.orderDrinks',
                'home.buttons.topUpBalance',
                'home.buttons.myAccount',
            ];
            preloadTranslations(translations, language, commonKeys);
        } catch (error) {
            translationErrorReporter.reportError({
                type: 'STORAGE_ERROR',
                language,
                message: `Failed to set language: ${error}`,
            });
        }
    };

    const getCurrentTranslations = (): TranslationKey => {
        return translations[currentLanguage] || translations.en;
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        return safeTranslate(
            (key: string, params?: Record<string, string | number>) => {
                // Validate parameters if provided
                if (params) {
                    const template = getCachedTranslation(translations, currentLanguage, key);
                    if (template) {
                        const validation = validateTranslationParams(template, params);
                        if (!validation.isValid) {
                            translationErrorReporter.reportError({
                                type: 'INVALID_PARAMS',
                                key,
                                language: currentLanguage,
                                message: `Missing parameters: ${validation.missingParams.join(', ')}`,
                            });
                        }
                    }
                }

                // Get cached translation
                const translation = getCachedTranslation(translations, currentLanguage, key);

                if (translation) {
                    return params ? optimizedInterpolate(translation, params) : translation;
                }

                // Final fallback with error reporting
                translationErrorReporter.reportError({
                    type: 'MISSING_KEY',
                    key,
                    language: currentLanguage,
                    message: `Translation missing for key: ${key}`,
                });

                return `Missing: ${key}`;
            },
            key,
            params,
            key,
        );
    };

    const contextValue: TranslationContextType = {
        currentLanguage,
        translations: getCurrentTranslations(),
        setLanguage,
        t,
        availableLanguages: SUPPORTED_LANGUAGES,
        isLoading,
    };

    return <TranslationContext.Provider value={contextValue}>{children}</TranslationContext.Provider>;
};
