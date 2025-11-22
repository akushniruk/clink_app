import { type JSX } from 'preact';
import { config } from '../../utils/env';
import { useTranslation } from '../../i18n';

interface MobileOnlyGuardProps {
    children: JSX.Element;
}

const isMobileOrTablet = () => {
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Check user agent for mobile/tablet patterns
    const userAgent = navigator.userAgent.toLowerCase();
    const mobilePatterns = [
        'android',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone',
        'mobile',
        'tablet',
        'touch',
        'webos',
        'kindle',
    ];
    const hasMobileUserAgent = mobilePatterns.some((pattern) => userAgent.includes(pattern));

    // Check screen size (tablets can be up to 1024px wide)
    const hasSmallScreen = window.innerWidth <= 1024;

    // Check orientation capability (mobile/tablet devices)
    const hasOrientationChange = 'orientation' in window;

    // Combine checks - device is considered mobile/tablet if:
    // - Has touch AND (mobile user agent OR small screen OR orientation change)
    return hasTouch && (hasMobileUserAgent || hasSmallScreen || hasOrientationChange);
};

export const MobileOnlyGuard = ({ children }: MobileOnlyGuardProps) => {
    const { t } = useTranslation();

    // Allow desktop in development mode
    if (config.allowDesktopInDev) {
        return children;
    }

    // Allow mobile and tablet devices
    if (isMobileOrTablet()) {
        return children;
    }

    return (
        <>
            <div
                class="mobile-only-fallback"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    overflow: 'hidden',
                    zIndex: 9999,
                    background: 'linear-gradient(180deg, rgba(56, 4, 4, 0.6) 0%, rgba(121, 29, 29, 0.6) 100%), #000',
                }}
            >
                {/* Background glow effects */}
                <div
                    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-25"
                    style={{
                        background: 'var(--color-cta)',
                        filter: 'blur(127.98px)',
                    }}
                />

                {/* Center circle with blur effect */}
                <div
                    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${STORY_COLORS.welcome}33 0%, transparent 70%)`,
                        backdropFilter: 'blur(70px)',
                    }}
                />

                <div
                    style={{
                        textAlign: 'center',
                        maxWidth: '28rem',
                        zIndex: 10,
                        position: 'relative',
                    }}
                >
                    {/* Large mobile phone icon with glow */}
                    <div
                        class="text-8xl mb-8 animate-pulse"
                        style={{
                            color: 'var(--color-cta)',
                            textShadow: `0 0 30px var(--color-cta), 0 0 60px var(--color-cta)`,
                            filter: 'drop-shadow(0 0 20px var(--color-cta))',
                        }}
                    >
                        📱
                    </div>

                    {/* Title with backdrop blur */}
                    <div class="relative mb-6">
                        <h1
                            class="text-4xl font-bold mb-2"
                            style={{
                                color: 'var(--color-shades-100)',
                                fontFamily: 'Sora, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: '700',
                                letterSpacing: '-0.2px',
                                textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                            }}
                        >
                            {t('mobileOnly.title')}
                        </h1>
                        <div
                            class="absolute inset-0 -z-10"
                            style={{
                                backdropFilter: 'blur(20px)',
                                maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
                            }}
                        />
                    </div>

                    {/* Description */}
                    <p
                        class="text-lg mb-8 leading-relaxed"
                        style={{
                            color: 'var(--color-shades-80)',
                            fontFamily: 'Sora, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontWeight: '400',
                        }}
                    >
                        {t('mobileOnly.description')}
                    </p>

                    {/* Badge with instruction */}
                    <div
                        class="inline-block px-6 py-3 rounded-full border backdrop-blur-sm"
                        style={{
                            backgroundColor: 'var(--color-cta-4)',
                            borderColor: 'var(--color-cta-2)',
                            color: 'var(--color-base-red)',
                            fontFamily: 'Sora, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '13px',
                            fontWeight: '700',
                            letterSpacing: '0.2px',
                        }}
                    >
                        {t('mobileOnly.instruction')}
                    </div>
                </div>
            </div>
            <div class="mobile-app">{children}</div>
        </>
    );
};

// Story colors for consistency
const STORY_COLORS = {
    welcome: 'var(--color-cta)',
} as const;
