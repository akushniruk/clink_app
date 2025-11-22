import { config } from './env';

// Extend Window interface for Google Analytics
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

export interface AnalyticsEvent {
    type: 'event' | 'pageView' | 'userProperties' | 'init' | 'otherEvent';
    name?: string;
    params?: Record<string, any>;
}

// Analytics event types for type safety
export interface OnboardingEvent {
    event:
        | 'onboarding_started'
        | 'onboarding_step_completed'
        | 'login_initiated'
        | 'login_success'
        | 'login_failed'
        | 'logout';
    step?: number;
    stage?: 'onboarding';
    user_id?: string;
    timestamp?: number;
    story_title?: string;
    story_theme?: string;
    device_type?: 'mobile' | 'desktop';
    browser?: string;
    language?: string;
    onboarding_type?: 'first_time' | 'returning';
    method?: 'email' | 'google' | 'wallet';
    error_reason?: string;
}

export interface BarJourneyEvent {
    event:
        | 'payment_initiated'
        | 'payment_form_viewed'
        | 'payment_form_submitted'
        | 'payment_confirmed'
        | 'payment_failed'
        | 'session_completed'
        | 'account_created'
        | 'balance_checked'
        | 'shared_link_opened'
        | 'shared_link_payment_confirmed'
        | 'shared_link_session_completed'
        | 'qr_scanned'; // Legacy event for backward compatibility
    step?: number;
    stage?: 'bar_journey';
    user_id?: string;
    timestamp?: number;
    session_id?: string;
    recipient_tag?: string;
    account_id?: string;
    value?: number;
    amount?: number; // Legacy field for backward compatibility
    currency?: string;
    method?: 'qr_scan' | 'manual_entry' | 'shared_link';
    payment_method?: string;
    session_duration?: number;
    device_type?: 'mobile' | 'desktop';
    browser?: string;
    language?: string;
    scanned_address?: string;
    scanner_type?: string;
    recipient_address?: string;
    transaction_id?: string;
    has_preset_amount?: boolean;
    link_type?: string;
    error_reason?: string;
}

export interface UserEvent {
    event:
        | 'page_view'
        | 'app_start'
        | 'feature_used'
        | 'error_occurred'
        | 'account_details_viewed'
        | 'user_tag_copied'
        | 'wallet_address_copied'
        | 'language_changed'
        | 'performance_metric';
    user_id?: string;
    timestamp?: number;
    page_name?: string;
    feature_name?: string;
    error_type?: string;
    error_message?: string;
    device_type?: 'mobile' | 'desktop';
    browser?: string;
    language?: string;
    language_code?: string;
    session_id?: string;
    metric_name?: string;
    metric_value?: number;
}

export interface PWAEvent {
    event:
        | 'pwa_prompt_shown'
        | 'pwa_install_accepted'
        | 'pwa_install_dismissed'
        | 'pwa_installed'
        | 'pwa_launched'
        | 'pwa_uninstalled';
    user_id?: string;
    timestamp?: number;
    device_type?: 'mobile' | 'desktop';
    browser?: string;
    language?: string;
    session_id?: string;
    install_source?: 'browser_prompt' | 'install_banner' | 'manual' | 'unknown';
    prompt_outcome?: 'accepted' | 'dismissed' | 'ignored';
    display_mode?: 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';
    days_since_first_visit?: number;
    times_prompted?: number;
}

// UTM parameters for campaign tracking
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// Check if user is already in Google Analytics dataLayer
export const isUserPresentInDataLayer = (smartWalletAddress: string): boolean => {
    const { dataLayer } = window;
    let isInDataLayer = false;

    if (dataLayer) {
        dataLayer.forEach((entry) => {
            const isConfig = entry[0] === 'config' && entry[1].includes('G-');

            if (isConfig && entry[2]?.smart_wallet_address === smartWalletAddress) {
                isInDataLayer = true;
            }
        });
    }

    return isInDataLayer;
};

// Extract UTM parameters from URL
const utmParams = (locationSearch: string): Record<string, string> => {
    const searchParams = new URLSearchParams(locationSearch);
    const resultingParams: Record<string, string> = {};

    searchParams.forEach((value, key) => {
        if (UTM_PARAMS.includes(key)) {
            resultingParams[key] = decodeURIComponent(value.replace(/\+/g, ' '));
        }
    });

    return resultingParams;
};

// Get device and browser information
const getDeviceInfo = (): { device_type: 'mobile' | 'desktop'; browser: string } => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    let browser = 'Unknown';
    if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
    else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

    return {
        device_type: isMobile ? 'mobile' : 'desktop',
        browser,
    };
};

// Send generic event to Google Analytics
const sendEvent = (eventAction: string, eventName: string = '', params?: Record<string, any>) => {
    const { gtag } = window;

    if (!gtag || !config.features.analytics) return;

    if (!params) {
        gtag(eventAction, eventName);
    } else {
        gtag(eventAction, eventName, params);
    }
};

// Send user properties to Google Analytics
const sendUserProperties = (propertyName: string, propertyValue: string) => {
    const { gtag } = window;

    if (!gtag || !config.features.analytics) return;

    gtag('set', 'user_properties', {
        [propertyName]: propertyValue,
    });
};

// Set user ID in Google Analytics
const sendUserId = (userId: string) => {
    const { gtag, dataLayer } = window;

    if (!gtag || !dataLayer || !config.features.analytics) return;

    dataLayer.forEach((layer) => {
        if (layer[0] === 'config' && layer[1].includes('G-')) {
            gtag('config', layer[1], {
                user_id: userId,
            });
        }
    });
};

// Generate session ID
const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// Get or create session ID
const getSessionId = (): string => {
    const sessionKey = 'analytics_session_id';
    let sessionId = sessionStorage.getItem(sessionKey);

    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem(sessionKey, sessionId);
    }

    return sessionId;
};

// PWA-specific utility functions
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

const getDaysSinceFirstVisit = (): number => {
    const firstVisitKey = 'analytics_first_visit';
    let firstVisit = localStorage.getItem(firstVisitKey);

    if (!firstVisit) {
        firstVisit = Date.now().toString();
        localStorage.setItem(firstVisitKey, firstVisit);
        return 0;
    }

    const daysDiff = Math.floor((Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24));
    return daysDiff;
};

const getPWAPromptCount = (): number => {
    const promptCountKey = 'pwa_prompt_count';
    const count = localStorage.getItem(promptCountKey);
    return count ? parseInt(count) : 0;
};

const incrementPWAPromptCount = (): number => {
    const promptCountKey = 'pwa_prompt_count';
    const currentCount = getPWAPromptCount();
    const newCount = currentCount + 1;
    localStorage.setItem(promptCountKey, newCount.toString());
    return newCount;
};

// Main analytics function
export const analytics = async (analyticEvent: AnalyticsEvent): Promise<void> => {
    // Don't send analytics if disabled or in development without explicit enable
    if (!config.features.analytics) {
        if (config.features.debug) {
            console.log('Analytics disabled, would send:', analyticEvent);
        }
        return;
    }

    const deviceInfo = getDeviceInfo();
    const sessionId = getSessionId();

    try {
        switch (analyticEvent.type) {
            case 'otherEvent':
                sendEvent('event', analyticEvent.name, analyticEvent.params);
                break;

            case 'pageView':
                const { location } = window;
                let defaultParams: Record<string, any> = {
                    ...analyticEvent.params,
                    ...deviceInfo,
                    session_id: sessionId,
                    timestamp: Date.now(),
                };

                if (location) {
                    defaultParams = {
                        ...defaultParams,
                        path: location.pathname,
                        ...utmParams(location.search),
                    };
                }

                sendEvent('event', analyticEvent.name || 'page_view', defaultParams);
                break;

            case 'userProperties':
                if (analyticEvent.params?.propertyName && analyticEvent.params?.propertyValue) {
                    sendUserProperties(analyticEvent.params.propertyName, analyticEvent.params.propertyValue);
                }
                break;

            case 'init':
                if (analyticEvent.params?.userId) {
                    sendUserId(analyticEvent.params.userId);
                }
                break;

            case 'event':
            default:
                const eventParams = {
                    ...analyticEvent.params,
                    ...deviceInfo,
                    session_id: sessionId,
                    timestamp: Date.now(),
                };

                sendEvent('event', analyticEvent.name || 'custom_event', eventParams);
                break;
        }

        if (config.features.debug) {
            console.log('Analytics event sent:', analyticEvent);
        }
    } catch (error) {
        console.error('Analytics error:', error);
    }
};

// Convenience functions for specific event types

// Onboarding events
export const trackOnboardingStarted = (onboardingType: 'first_time' | 'returning' = 'first_time', userId?: string) => {
    const eventData: OnboardingEvent = {
        event: 'onboarding_started',
        stage: 'onboarding',
        user_id: userId,
        timestamp: Date.now(),
        onboarding_type: onboardingType,
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'onboarding_started',
        params: eventData,
    });
};

export const trackOnboardingStep = (step: number, storyTitle?: string, storyTheme?: string, userId?: string) => {
    const eventData: OnboardingEvent = {
        event: 'onboarding_step_completed',
        step,
        stage: 'onboarding',
        user_id: userId,
        timestamp: Date.now(),
        story_title: storyTitle,
        story_theme: storyTheme,
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'onboarding_step_completed',
        params: eventData,
    });
};

export const trackLoginInitiated = (method: 'email' | 'google' | 'wallet', userId?: string) => {
    const eventData: OnboardingEvent = {
        event: 'login_initiated',
        user_id: userId,
        timestamp: Date.now(),
        method,
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'login_initiated',
        params: eventData,
    });
};

export const trackLoginSuccess = (method: 'email' | 'google' | 'wallet', userId: string) => {
    const eventData: OnboardingEvent = {
        event: 'login_success',
        user_id: userId,
        timestamp: Date.now(),
        method,
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'login_success',
        params: eventData,
    });
};

export const trackLoginFailed = (method: 'email' | 'google' | 'wallet', errorReason: string, userId?: string) => {
    const eventData: OnboardingEvent = {
        event: 'login_failed',
        user_id: userId,
        timestamp: Date.now(),
        method,
        error_reason: errorReason,
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'login_failed',
        params: eventData,
    });
};

export const trackLogout = (userId?: string) => {
    const eventData: OnboardingEvent = {
        event: 'logout',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'logout',
        params: eventData,
    });
};

// Legacy function - use trackLoginSuccess instead
export const trackLoginCompleted = (userId: string) => {
    // Call the new trackLoginSuccess function
    trackLoginSuccess('email', userId);
};

export const trackBarJourneyStep = (
    event: BarJourneyEvent['event'],
    step: number,
    userId?: string,
    additionalData?: Partial<BarJourneyEvent>,
) => {
    const eventData: BarJourneyEvent = {
        event,
        step,
        stage: 'bar_journey',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        ...additionalData,
    };

    analytics({
        type: 'event',
        name: event,
        params: eventData,
    });
};

// Payment-specific tracking functions
export const trackPaymentInitiated = (method: 'qr_scan' | 'manual_entry' | 'shared_link', userId?: string) => {
    const eventData: BarJourneyEvent = {
        event: 'payment_initiated',
        user_id: userId,
        timestamp: Date.now(),
        method,
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
    };

    analytics({
        type: 'event',
        name: 'payment_initiated',
        params: eventData,
    });
};

export const trackPaymentFormViewed = (sessionId: string, recipientTag?: string, userId?: string) => {
    const eventData: BarJourneyEvent = {
        event: 'payment_form_viewed',
        user_id: userId,
        timestamp: Date.now(),
        session_id: sessionId,
        recipient_tag: recipientTag,
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'payment_form_viewed',
        params: eventData,
    });
};

export const trackPaymentFormSubmitted = (sessionId: string, value: number, currency: string, userId?: string) => {
    const eventData: BarJourneyEvent = {
        event: 'payment_form_submitted',
        user_id: userId,
        timestamp: Date.now(),
        session_id: sessionId,
        value,
        currency,
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'payment_form_submitted',
        params: eventData,
    });
};

export const trackPaymentConfirmed = (
    sessionId: string,
    transactionId: string,
    userId?: string,
    additionalData?: Partial<BarJourneyEvent>,
) => {
    const eventData: BarJourneyEvent = {
        event: 'payment_confirmed',
        user_id: userId,
        timestamp: Date.now(),
        session_id: sessionId,
        transaction_id: transactionId,
        ...getDeviceInfo(),
        language: navigator.language,
        ...additionalData,
    };

    analytics({
        type: 'event',
        name: 'payment_confirmed',
        params: eventData,
    });
};

export const trackPaymentFailed = (sessionId: string, errorReason: string, userId?: string) => {
    const eventData: BarJourneyEvent = {
        event: 'payment_failed',
        user_id: userId,
        timestamp: Date.now(),
        session_id: sessionId,
        error_reason: errorReason,
        ...getDeviceInfo(),
        language: navigator.language,
    };

    analytics({
        type: 'event',
        name: 'payment_failed',
        params: eventData,
    });
};

export const trackPageView = (pageName: string, userId?: string, additionalData?: Record<string, any>) => {
    const eventData: UserEvent = {
        event: 'page_view',
        user_id: userId,
        timestamp: Date.now(),
        page_name: pageName,
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
        ...additionalData,
    };

    analytics({
        type: 'pageView',
        name: 'page_view',
        params: eventData,
    });
};

export const trackError = (errorType: string, errorMessage: string, userId?: string) => {
    const eventData: UserEvent = {
        event: 'error_occurred',
        user_id: userId,
        timestamp: Date.now(),
        error_type: errorType,
        error_message: errorMessage,
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
    };

    analytics({
        type: 'event',
        name: 'error_occurred',
        params: eventData,
    });
};

export const trackFeatureUsed = (featureName: string, userId?: string, additionalData?: Record<string, any>) => {
    const eventData: UserEvent = {
        event: 'feature_used',
        user_id: userId,
        timestamp: Date.now(),
        feature_name: featureName,
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
        ...additionalData,
    };

    analytics({
        type: 'event',
        name: 'feature_used',
        params: eventData,
    });
};

// Account & Feature events
export const trackAccountDetailsViewed = (userId?: string) => {
    const eventData: UserEvent = {
        event: 'account_details_viewed',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
    };

    analytics({
        type: 'event',
        name: 'account_details_viewed',
        params: eventData,
    });
};

export const trackUserTagCopied = (userId?: string) => {
    const eventData: UserEvent = {
        event: 'user_tag_copied',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
    };

    analytics({
        type: 'event',
        name: 'user_tag_copied',
        params: eventData,
    });
};

export const trackWalletAddressCopied = (userId?: string) => {
    const eventData: UserEvent = {
        event: 'wallet_address_copied',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
    };

    analytics({
        type: 'event',
        name: 'wallet_address_copied',
        params: eventData,
    });
};

export const trackLanguageChanged = (languageCode: string, userId?: string) => {
    const eventData: UserEvent = {
        event: 'language_changed',
        user_id: userId,
        timestamp: Date.now(),
        language_code: languageCode,
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
    };

    analytics({
        type: 'event',
        name: 'language_changed',
        params: eventData,
    });
};

export const trackPerformanceMetric = (metricName: string, metricValue: number, userId?: string) => {
    const eventData: UserEvent = {
        event: 'performance_metric',
        user_id: userId,
        timestamp: Date.now(),
        metric_name: metricName,
        metric_value: metricValue,
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
    };

    analytics({
        type: 'event',
        name: 'performance_metric',
        params: eventData,
    });
};

// PWA-specific tracking functions
export const trackPWAPromptShown = (userId?: string, source: PWAEvent['install_source'] = 'unknown') => {
    const promptCount = incrementPWAPromptCount();

    const eventData: PWAEvent = {
        event: 'pwa_prompt_shown',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
        install_source: source,
        display_mode: getPWADisplayMode(),
        days_since_first_visit: getDaysSinceFirstVisit(),
        times_prompted: promptCount,
    };

    analytics({
        type: 'event',
        name: 'pwa_prompt_shown',
        params: eventData,
    });
};

export const trackPWAInstallResponse = (
    outcome: PWAEvent['prompt_outcome'],
    userId?: string,
    source: PWAEvent['install_source'] = 'unknown',
) => {
    const eventName = outcome === 'accepted' ? 'pwa_install_accepted' : 'pwa_install_dismissed';

    const eventData: PWAEvent = {
        event: eventName,
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
        install_source: source,
        prompt_outcome: outcome,
        display_mode: getPWADisplayMode(),
        days_since_first_visit: getDaysSinceFirstVisit(),
        times_prompted: getPWAPromptCount(),
    };

    analytics({
        type: 'event',
        name: eventName,
        params: eventData,
    });
};

export const trackPWAInstalled = (userId?: string, source: PWAEvent['install_source'] = 'unknown') => {
    const eventData: PWAEvent = {
        event: 'pwa_installed',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
        install_source: source,
        display_mode: getPWADisplayMode(),
        days_since_first_visit: getDaysSinceFirstVisit(),
        times_prompted: getPWAPromptCount(),
    };

    analytics({
        type: 'event',
        name: 'pwa_installed',
        params: eventData,
    });
};

export const trackPWALaunched = (userId?: string) => {
    const eventData: PWAEvent = {
        event: 'pwa_launched',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
        display_mode: getPWADisplayMode(),
        days_since_first_visit: getDaysSinceFirstVisit(),
    };

    analytics({
        type: 'event',
        name: 'pwa_launched',
        params: eventData,
    });
};

export const trackPWAUninstalled = (userId?: string) => {
    const eventData: PWAEvent = {
        event: 'pwa_uninstalled',
        user_id: userId,
        timestamp: Date.now(),
        ...getDeviceInfo(),
        language: navigator.language,
        session_id: getSessionId(),
        display_mode: getPWADisplayMode(),
    };

    analytics({
        type: 'event',
        name: 'pwa_uninstalled',
        params: eventData,
    });
};

// Initialize analytics with user
export const initializeAnalytics = (userId: string) => {
    analytics({
        type: 'init',
        params: { userId },
    });

    // Set user properties
    analytics({
        type: 'userProperties',
        params: {
            propertyName: 'user_id',
            propertyValue: userId,
        },
    });

    // Track app start
    analytics({
        type: 'event',
        name: 'app_start',
        params: {
            user_id: userId,
            timestamp: Date.now(),
            ...getDeviceInfo(),
            language: navigator.language,
            session_id: getSessionId(),
            display_mode: getPWADisplayMode(),
        },
    });

    // Track PWA launch if running in standalone mode
    if (getPWADisplayMode() === 'standalone') {
        trackPWALaunched(userId);
    }
};
