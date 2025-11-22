import type { SupportedLanguage } from './types';
import { DEFAULT_LANGUAGE } from './constants';

/**
 * Production-grade error handling for i18n system
 */

interface TranslationError {
    type: 'MISSING_KEY' | 'INVALID_PARAMS' | 'NETWORK_ERROR' | 'STORAGE_ERROR' | 'DETECTION_ERROR';
    key?: string;
    language?: SupportedLanguage;
    message: string;
    timestamp: number;
    userAgent?: string;
}

class TranslationErrorReporter {
    private errors: TranslationError[] = [];
    private maxErrors = 100; // Prevent memory leaks
    private isDevelopment = import.meta.env.DEV;

    /**
     * Report a translation error
     */
    reportError(error: Omit<TranslationError, 'timestamp' | 'userAgent'>): void {
        const fullError: TranslationError = {
            ...error,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
        };

        // Add to error log
        this.errors.push(fullError);

        // Maintain error log size
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Development logging
        if (this.isDevelopment) {
            // Translation Error logged
        }

        // Production error reporting (could send to analytics)
        if (!this.isDevelopment) {
            this.sendErrorToAnalytics(fullError);
        }
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const errorsByType = this.errors.reduce(
            (acc, error) => {
                acc[error.type] = (acc[error.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        return {
            totalErrors: this.errors.length,
            errorsByType,
            recentErrors: this.errors.slice(-10),
            oldestError: this.errors[0]?.timestamp,
            newestError: this.errors[this.errors.length - 1]?.timestamp,
        };
    }

    /**
     * Clear error log
     */
    clearErrors(): void {
        this.errors = [];
    }

    /**
     * Send error to analytics (placeholder for production)
     */
    private sendErrorToAnalytics(error: TranslationError): void {
        // In production, this would send to your analytics service
        // For now, we'll just store it locally for debugging
        try {
            const storageKey = 'clink-i18n-errors';
            const existingErrors = JSON.parse(localStorage.getItem(storageKey) || '[]');
            existingErrors.push(error);

            // Keep only last 50 errors in storage
            const recentErrors = existingErrors.slice(-50);
            localStorage.setItem(storageKey, JSON.stringify(recentErrors));
        } catch (e) {
            // Silent fail for storage errors
        }
    }
}

// Singleton error reporter
export const translationErrorReporter = new TranslationErrorReporter();

/**
 * Safe translation function with comprehensive error handling
 */
export function safeTranslate(
    translateFn: (key: string, params?: Record<string, string | number>) => string,
    key: string,
    params?: Record<string, string | number>,
    fallback?: string,
): string {
    try {
        const result = translateFn(key, params);

        // Check if translation failed (returned error message)
        if (result.startsWith('Missing:') || result.startsWith('Error:')) {
            translationErrorReporter.reportError({
                type: 'MISSING_KEY',
                key,
                message: `Translation missing for key: ${key}`,
            });

            return fallback || key;
        }

        return result;
    } catch (error) {
        translationErrorReporter.reportError({
            type: 'INVALID_PARAMS',
            key,
            message: `Translation error for key: ${key} - ${error}`,
        });

        return fallback || key;
    }
}

/**
 * Validate translation parameters
 */
export function validateTranslationParams(
    template: string,
    params: Record<string, string | number>,
): { isValid: boolean; missingParams: string[] } {
    const paramMatches = template.match(/\{(\w+)\}/g);

    if (!paramMatches) {
        return { isValid: true, missingParams: [] };
    }

    const requiredParams = paramMatches.map((match) => match.slice(1, -1));
    const missingParams = requiredParams.filter((param) => !(param in params));

    return {
        isValid: missingParams.length === 0,
        missingParams,
    };
}

/**
 * Safe language detection with error handling
 */
export function safeLanguageDetection(detectionFn: () => SupportedLanguage): SupportedLanguage {
    try {
        return detectionFn();
    } catch (error) {
        translationErrorReporter.reportError({
            type: 'DETECTION_ERROR',
            message: `Language detection failed: ${error}`,
        });

        return DEFAULT_LANGUAGE;
    }
}

/**
 * Safe localStorage operations
 */
export function safeStorageOperation<T>(operation: () => T, fallback: T, operationType: 'read' | 'write'): T {
    try {
        return operation();
    } catch (error) {
        translationErrorReporter.reportError({
            type: 'STORAGE_ERROR',
            message: `Storage ${operationType} failed: ${error}`,
        });

        return fallback;
    }
}

/**
 * Get error diagnostics for debugging
 */
export function getTranslationDiagnostics() {
    return {
        errors: translationErrorReporter.getErrorStats(),
        performance: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            timestamp: Date.now(),
        },
    };
}
