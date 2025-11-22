import { useState, useEffect, useCallback } from 'react';
import { trackPWAInstallResponse, trackPWAInstalled } from '../utils/analytics';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallPwaState {
    isInstallable: boolean;
    isIOS: boolean;
    isMacOSSafari: boolean;
    isStandalone: boolean;
    isPWAInAppBrowser: boolean;
    deferredPrompt: BeforeInstallPromptEvent | null;
    isInstallBannerDismissed: boolean;
    showIOSInstructions: boolean;
}

export function useInstallPwa() {
    const [state, setState] = useState<InstallPwaState>({
        isInstallable: false,
        isIOS: false,
        isMacOSSafari: false,
        isStandalone: false,
        isPWAInAppBrowser: false,
        deferredPrompt: null,
        isInstallBannerDismissed: false,
        showIOSInstructions: false,
    });

    // Check if app is already installed
    const checkIfStandalone = useCallback(() => {
        // Check if the app is in standalone mode (already installed)
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: minimal-ui)').matches ||
            window.matchMedia('(display-mode: fullscreen)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://') ||
            window.location.search.includes('utm_source=web_app_manifest');

        return isStandalone;
    }, []);

    // Check if PWA was previously installed (for browser tab detection)
    const checkIfPWAInstalled = useCallback(() => {
        // Check localStorage for installation flag
        const wasInstalled = localStorage.getItem('pwa-was-installed');

        if (wasInstalled === 'true') return true;

        // Use getInstalledRelatedApps API if available (Chrome 80+)
        if ('getInstalledRelatedApps' in navigator) {
            (navigator as any)
                .getInstalledRelatedApps()
                .then((apps: any[]) => {
                    if (apps.length > 0) {
                        localStorage.setItem('pwa-was-installed', 'true');
                        setState((prev) => ({ ...prev, isStandalone: true }));
                    }
                })
                .catch(() => {
                    // API not available or failed, continue with other detection methods
                });
        }

        return false;
    }, []);

    // Check if banner was dismissed before
    const checkIfBannerDismissed = useCallback(() => {
        const dismissed = localStorage.getItem('pwa-install-banner-dismissed');

        return dismissed === 'true';
    }, []);

    // Detect device and browser environment
    const detectEnvironment = useCallback(() => {
        const ua = window.navigator.userAgent.toLowerCase();

        const isIOS = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
        const isMacOS = /macintosh/.test(ua) && 'ontouchend' in document === false;
        const isSafari = /safari/.test(ua) && !/chrome|chromium|crios|fxios/.test(ua);
        const isMacOSSafari = isMacOS && isSafari;

        // Check if it's a PWA viewed in an in-app browser (e.g., opened from social media)
        const isPWAInAppBrowser = /instagram|facebook|twitter|linkedin|whatsapp/.test(ua) && !isIOS;

        return {
            isIOS,
            isMacOSSafari,
            isPWAInAppBrowser,
        };
    }, []);

    // Toggle iOS instructions modal
    const toggleIOSInstructions = useCallback(() => {
        setState((prev) => ({
            ...prev,
            showIOSInstructions: !prev.showIOSInstructions,
        }));
    }, []);

    // Handle the install prompt for browsers that support it (mainly Chrome/Android)
    const handleInstallPrompt = useCallback(
        async (userId?: string) => {
            if (!state.deferredPrompt) {
                console.log('No installation prompt available');
                return;
            }

            // Show the install prompt
            state.deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const choiceResult = await state.deferredPrompt.userChoice;

            // Track the user's response
            trackPWAInstallResponse(choiceResult.outcome, userId, 'browser_prompt');

            // Reset the deferred prompt variable after use
            setState((prev) => ({ ...prev, deferredPrompt: null }));

            // Check if the user accepted the prompt
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                // Mark PWA as installed in localStorage for future detection
                localStorage.setItem('pwa-was-installed', 'true');

                // Track successful installation
                trackPWAInstalled(userId, 'browser_prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
        },
        [state.deferredPrompt],
    );

    // Dismiss the install banner and save preference to localStorage
    const dismissInstallBanner = useCallback(() => {
        localStorage.setItem('pwa-install-banner-dismissed', 'true');
        setState((prev) => ({ ...prev, isInstallBannerDismissed: true }));
    }, []);

    // Reset the dismissed state (for testing purposes)
    const resetDismissedState = useCallback(() => {
        localStorage.removeItem('pwa-install-banner-dismissed');
        setState((prev) => ({ ...prev, isInstallBannerDismissed: false }));
    }, []);

    // Initialize the hook
    useEffect(() => {
        const env = detectEnvironment();
        const isStandalone = checkIfStandalone();
        const isInstallBannerDismissed = checkIfBannerDismissed();
        const wasPWAInstalled = checkIfPWAInstalled();

        // Update state with environment detection
        setState((prev) => ({
            ...prev,
            isIOS: env.isIOS || false,
            isMacOSSafari: env.isMacOSSafari || false,
            isPWAInAppBrowser: env.isPWAInAppBrowser || false,
            isStandalone: isStandalone || wasPWAInstalled,
            isInstallBannerDismissed,
        }));

        // Event listener for beforeinstallprompt (Chrome/Android)
        const handleBeforeInstallPrompt = (e: Event) => {
            console.log('🔔 beforeinstallprompt event fired - PWA is installable!');

            // Prevent the default browser install prompt
            e.preventDefault();

            // Store the event for later use
            setState((prev) => ({
                ...prev,
                deferredPrompt: e as BeforeInstallPromptEvent,
                isInstallable: true,
            }));

            console.log('✅ Install prompt deferred, custom banner will show after user engagement');
        };

        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if the display mode changes (e.g., user installs the app)
        const mediaQueryList = window.matchMedia('(display-mode: standalone)');
        const handleDisplayModeChange = (e: MediaQueryListEvent) => {
            setState((prev) => ({
                ...prev,
                isStandalone: e.matches,
            }));
        };

        mediaQueryList.addEventListener('change', handleDisplayModeChange);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            mediaQueryList.removeEventListener('change', handleDisplayModeChange);
        };
    }, [checkIfBannerDismissed, checkIfStandalone, checkIfPWAInstalled, detectEnvironment]);

    return {
        ...state,
        promptInstall: handleInstallPrompt,
        dismissInstallBanner,
        toggleIOSInstructions,
        resetDismissedState, // Mainly for testing
        canPromptInstall:
            state.isInstallable && !state.isStandalone && !state.isInstallBannerDismissed && !!state.deferredPrompt,
        shouldShowIOSBanner: state.isIOS && !state.isStandalone && !state.isInstallBannerDismissed,
    };
}
