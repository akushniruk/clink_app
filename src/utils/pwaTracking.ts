import { trackPWAInstalled, trackPWAUninstalled } from './analytics';

/**
 * Setup PWA lifecycle event listeners
 * This should be called early in the app lifecycle
 */
export const setupPWATracking = (userId?: string): (() => void) => {
    // Track PWA installation (appinstalled event)
    const handleAppInstalled = () => {
        console.log('PWA installed successfully');
        localStorage.setItem('pwa-was-installed', 'true');
        trackPWAInstalled(userId, 'manual');
    };

    // Track PWA uninstallation (beforeunload when in standalone mode)
    const handleBeforeUnload = () => {
        // This only fires when the PWA is actually being closed/uninstalled
        const isPWAStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const wasInstalled = localStorage.getItem('pwa-was-installed') === 'true';

        if (isPWAStandalone && wasInstalled) {
            // Mark as potentially uninstalled (will be verified on next visit)
            localStorage.setItem('pwa-uninstall-check', Date.now().toString());
        }
    };

    // Check for PWA uninstallation on app start
    const checkForUninstallation = () => {
        const uninstallCheck = localStorage.getItem('pwa-uninstall-check');
        const wasInstalled = localStorage.getItem('pwa-was-installed') === 'true';
        const isPWAStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (uninstallCheck && wasInstalled && !isPWAStandalone) {
            // User was in standalone mode but now in browser - likely uninstalled
            const uninstallTime = parseInt(uninstallCheck);
            const hoursSinceCheck = (Date.now() - uninstallTime) / (1000 * 60 * 60);

            // If it's been more than 1 hour, consider it uninstalled
            if (hoursSinceCheck >= 1) {
                console.log('PWA appears to have been uninstalled');
                trackPWAUninstalled(userId);
                localStorage.removeItem('pwa-was-installed');
                localStorage.removeItem('pwa-uninstall-check');
            }
        } else if (uninstallCheck) {
            // Clear check if user is still in standalone mode
            localStorage.removeItem('pwa-uninstall-check');
        }
    };

    // Add event listeners
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check for uninstallation on startup
    checkForUninstallation();

    // Return cleanup function
    return () => {
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
};

/**
 * Check if PWA is running in standalone mode
 */
export const isPWAStandalone = (): boolean => {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (navigator as any).standalone === true
    );
};

/**
 * Get PWA installation metrics
 */
export const getPWAMetrics = () => {
    const wasInstalled = localStorage.getItem('pwa-was-installed') === 'true';
    const promptCount = localStorage.getItem('pwa_prompt_count') || '0';
    const firstVisit = localStorage.getItem('analytics_first_visit');

    let daysSinceFirstVisit = 0;
    if (firstVisit) {
        daysSinceFirstVisit = Math.floor((Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24));
    }

    return {
        isStandalone: isPWAStandalone(),
        wasInstalled,
        promptCount: parseInt(promptCount),
        daysSinceFirstVisit,
        displayMode: getPWADisplayMode(),
    };
};

/**
 * Get current PWA display mode
 */
const getPWADisplayMode = (): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'fullscreen';
    }
    return 'browser';
};
