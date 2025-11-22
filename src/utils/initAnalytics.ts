import { config } from './env';

/**
 * Initialize Google Analytics in the document head
 * This should be called early in the app lifecycle
 */
export const initGoogleAnalytics = (): void => {
    // Don't initialize if analytics is disabled or no measurement ID
    if (!config.analytics.enabled || !config.analytics.measurementId) {
        if (config.features.debug) {
            console.log('Google Analytics not initialized - disabled or no measurement ID');
        }
        return;
    }

    try {
        // Create script elements for Google Analytics
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${config.analytics.measurementId}`;

        const gtagConfig = document.createElement('script');
        gtagConfig.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${config.analytics.measurementId}', {
                send_page_view: false,
                cookie_flags: 'SameSite=None;Secure',
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false
            });
        `;

        // Add scripts to head
        document.head.appendChild(gtagScript);
        document.head.appendChild(gtagConfig);

        // Set global gtag function
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer?.push(arguments);
        };

        if (config.features.debug) {
            console.log('Google Analytics initialized with ID:', config.analytics.measurementId);
        }
    } catch (error) {
        console.error('Failed to initialize Google Analytics:', error);
    }
};

/**
 * Check if Google Analytics is loaded and ready
 */
export const isAnalyticsReady = (): boolean => {
    return !!(window.gtag && window.dataLayer);
};

/**
 * Wait for Google Analytics to be ready (with timeout)
 */
export const waitForAnalytics = (timeout: number = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
        if (isAnalyticsReady()) {
            resolve(true);
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (isAnalyticsReady()) {
                clearInterval(checkInterval);
                resolve(true);
                return;
            }

            if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                resolve(false);
                return;
            }
        }, 100);
    });
};
