import { useState, useEffect } from 'preact/hooks';
import { STORAGE_KEY } from '../components/onboarding';

const LEGACY_ONBOARDING_KEY = 'clink_onboarding_completed';
const USER_PREFERENCE_KEY = 'clink_user_preferences';

interface UserPreferences {
    hasCompletedOnboarding: boolean;
    onboardingCompletedAt?: string;
    version: string;
}

const CURRENT_ONBOARDING_VERSION = '1.0.0';

export function useFirstTimeUser() {
    const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        checkFirstTimeUser();
    }, []);

    const checkFirstTimeUser = () => {
        try {
            // Check current storage key
            const currentCompleted = localStorage.getItem(STORAGE_KEY);

            // Check legacy keys for backward compatibility
            const legacyCompleted = localStorage.getItem(LEGACY_ONBOARDING_KEY);

            // Check new preferences system
            const preferencesStr = localStorage.getItem(USER_PREFERENCE_KEY);
            let preferences: UserPreferences | null = null;

            if (preferencesStr) {
                try {
                    preferences = JSON.parse(preferencesStr);
                } catch (e) {
                    // Failed to parse user preferences, resetting
                    localStorage.removeItem(USER_PREFERENCE_KEY);
                }
            }

            // User has completed onboarding if any of:
            // 1. Current key exists and is 'true'
            // 2. Legacy key exists and is 'true'
            // 3. New preferences exist and show completion for current version
            const hasCompleted =
                currentCompleted === 'true' ||
                legacyCompleted === 'true' ||
                (preferences?.hasCompletedOnboarding && preferences?.version === CURRENT_ONBOARDING_VERSION);

            setIsFirstTime(!hasCompleted);
            setIsLoading(false);
        } catch (error) {
            // On error, assume first time user for better UX
            // Error checking first time user status
            setIsFirstTime(true);
            setIsLoading(false);
        }
    };

    const markOnboardingComplete = () => {
        try {
            const preferences: UserPreferences = {
                hasCompletedOnboarding: true,
                onboardingCompletedAt: new Date().toISOString(),
                version: CURRENT_ONBOARDING_VERSION,
            };

            // Save to new preferences system
            localStorage.setItem(USER_PREFERENCE_KEY, JSON.stringify(preferences));

            // Save to current storage key
            localStorage.setItem(STORAGE_KEY, 'true');

            // Keep legacy key for backward compatibility
            localStorage.setItem(LEGACY_ONBOARDING_KEY, 'true');

            setIsFirstTime(false);
        } catch (error) {
            // Failed to save onboarding completion
            // Still mark as complete in memory to avoid repeated onboarding
            setIsFirstTime(false);
        }
    };

    const resetOnboarding = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(LEGACY_ONBOARDING_KEY);
            localStorage.removeItem(USER_PREFERENCE_KEY);
            setIsFirstTime(true);
        } catch (error) {
            // Failed to reset onboarding
        }
    };

    const getOnboardingInfo = (): UserPreferences | null => {
        try {
            const preferencesStr = localStorage.getItem(USER_PREFERENCE_KEY);
            if (preferencesStr) {
                return JSON.parse(preferencesStr);
            }
        } catch (error) {
            // Failed to get onboarding info
        }
        return null;
    };

    return {
        isFirstTime,
        isLoading,
        markOnboardingComplete,
        resetOnboarding,
        getOnboardingInfo,
        checkFirstTimeUser,
    };
}
