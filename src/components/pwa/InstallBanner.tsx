import { useState, useEffect } from 'preact/hooks';
import { useInstallPwa } from '../../hooks/useInstallPwa';
import { useT } from '../../i18n';
import { trackPWAPromptShown, trackPWAInstallResponse } from '../../utils/analytics';
import { useLoginState } from '../../hooks/useLoginState';

interface InstallBannerProps {
    // Time in milliseconds to wait before showing the banner
    delayBeforeShow?: number;
    // Time in milliseconds to wait for user engagement
    engagementDelay?: number;
    // Custom title for the banner
    title?: string;
    // Custom description for the banner
    description?: string;
    // Custom class names
    className?: string;
}

export const InstallBanner = ({
    delayBeforeShow = 100,
    engagementDelay = 200,
    title,
    description,
    className = '',
}: InstallBannerProps) => {
    const t = useT();
    const { walletAddress } = useLoginState();
    // Simple mobile detection
    const isMobile = window.innerWidth <= 768;

    // Check if opened from QR code or external source
    const isFromQR = new URLSearchParams(window.location.search).get('source') === 'pwa';

    console.log('🔗 InstallBanner: Opened from QR/external source:', isFromQR);

    const {
        isIOS,
        isStandalone,
        canPromptInstall,
        shouldShowIOSBanner,
        promptInstall,
        dismissInstallBanner,
        showIOSInstructions,
        toggleIOSInstructions,
    } = useInstallPwa();

    const [showBanner, setShowBanner] = useState(false);
    const [hasEngaged, setHasEngaged] = useState(false);
    const [isLogoLoaded, setIsLogoLoaded] = useState(false);

    // Check for user engagement
    useEffect(() => {
        // If opened from QR/external source, consider immediately engaged
        if (isFromQR) {
            console.log('🔗 InstallBanner: Opened from QR/external source, bypassing engagement delay');
            setHasEngaged(true);
            return;
        }

        console.log('🎯 InstallBanner: Setting up engagement tracking...');

        const engagementTimer = setTimeout(() => {
            console.log('⏰ InstallBanner: Engagement timeout reached, user considered engaged');
            setHasEngaged(true);
        }, engagementDelay);

        // Track user engagement by listening to user interactions
        const trackEngagement = () => {
            console.log('👆 InstallBanner: User interaction detected, marking as engaged');
            setHasEngaged(true);
            clearTimeout(engagementTimer);
            // Remove event listeners once engaged
            window.removeEventListener('scroll', trackEngagement);
            window.removeEventListener('click', trackEngagement);
            window.removeEventListener('touchstart', trackEngagement);
        };

        window.addEventListener('scroll', trackEngagement);
        window.addEventListener('click', trackEngagement);
        window.addEventListener('touchstart', trackEngagement);

        return () => {
            clearTimeout(engagementTimer);
            window.removeEventListener('scroll', trackEngagement);
            window.removeEventListener('click', trackEngagement);
            window.removeEventListener('touchstart', trackEngagement);
        };
    }, [engagementDelay, isFromQR]);

    // Show banner after delay and user engagement
    useEffect(() => {
        console.log('🔍 InstallBanner: Checking banner conditions...', {
            isStandalone,
            hasEngaged,
            isIOS,
            canPromptInstall,
            shouldShowIOSBanner,
            delayBeforeShow,
        });

        if (isStandalone) {
            console.log('📱 InstallBanner: App already installed, not showing banner');
            return; // Don't show if already installed
        }

        let timer: number;

        if (hasEngaged) {
            console.log('✅ InstallBanner: User engaged, setting banner delay timer...');
            // Reduce delay for QR/external source users
            const actualDelay = isFromQR ? 1000 : delayBeforeShow; // 1 second for QR users
            console.log('⏱️ InstallBanner: Using delay:', actualDelay, 'ms (QR source:', isFromQR, ')');

            timer = window.setTimeout(() => {
                const shouldShow = (isIOS && shouldShowIOSBanner) || (!isIOS && canPromptInstall);
                console.log('🎪 InstallBanner: Delay completed, should show banner:', shouldShow);
                if (shouldShow) {
                    setShowBanner(true);
                    console.log('🎉 InstallBanner: Banner displayed!');

                    // Track PWA prompt shown
                    trackPWAPromptShown(walletAddress || undefined, isFromQR ? 'install_banner' : 'install_banner');
                }
            }, actualDelay);
        }

        return () => clearTimeout(timer);
    }, [hasEngaged, isIOS, canPromptInstall, shouldShowIOSBanner, isStandalone, delayBeforeShow, isFromQR]);

    // Handle banner dismissal
    const handleDismiss = () => {
        // Track dismiss event
        trackPWAInstallResponse('dismissed', walletAddress || undefined, 'install_banner');

        setShowBanner(false);
        dismissInstallBanner();
    };

    // Handle iOS installation tutorial
    const handleIOSTutorial = () => {
        // Track iOS tutorial engagement
        trackPWAInstallResponse('accepted', walletAddress || undefined, 'install_banner');

        toggleIOSInstructions();
    };

    // iOS installation steps data
    const iosSteps = [
        {
            titleKey: 'pwa.ios.step1.title',
            descriptionKey: 'pwa.ios.step1.description',
            icon: (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="12" fill="#392E2C" />
                    <path
                        d="M23.8408 41.8743C22.7728 41.8743 21.9676 41.6059 21.4253 41.0691C20.883 40.5378 20.6118 39.741 20.6118 38.6785V28.0286C20.6118 26.9661 20.883 26.1664 21.4253 25.6296C21.9676 25.0929 22.7728 24.8245 23.8408 24.8245H27.4019V26.302H23.874C23.293 26.302 22.8475 26.4542 22.5376 26.7585C22.2332 27.0629 22.0811 27.5111 22.0811 28.1033V38.5955C22.0811 39.1931 22.2332 39.6441 22.5376 39.9485C22.8475 40.2528 23.293 40.405 23.874 40.405H36.126C36.696 40.405 37.1359 40.2528 37.4458 39.9485C37.7612 39.6441 37.9189 39.1931 37.9189 38.5955V28.1033C37.9189 27.5111 37.7612 27.0629 37.4458 26.7585C37.1359 26.4542 36.696 26.302 36.126 26.302H32.5981V24.8245H36.1592C37.2327 24.8245 38.0379 25.0956 38.5747 25.6379C39.117 26.1747 39.3882 26.9716 39.3882 28.0286V38.6785C39.3882 39.7354 39.117 40.5323 38.5747 41.0691C38.0379 41.6059 37.2327 41.8743 36.1592 41.8743H23.8408ZM30 33.5735C29.8008 33.5735 29.6292 33.5043 29.4854 33.366C29.3415 33.2221 29.2695 33.0533 29.2695 32.8596V21.72L29.3276 20.1428L28.6719 20.8318L26.8623 22.7244C26.7295 22.8738 26.5607 22.9485 26.356 22.9485C26.1678 22.9485 26.0101 22.8876 25.8828 22.7659C25.7611 22.6441 25.7002 22.4892 25.7002 22.301C25.7002 22.2014 25.7168 22.1156 25.75 22.0437C25.7887 21.9662 25.8441 21.8915 25.916 21.8196L29.4688 18.3665C29.5628 18.2724 29.6514 18.2087 29.7344 18.1755C29.8174 18.1423 29.9059 18.1257 30 18.1257C30.0941 18.1257 30.1826 18.1423 30.2656 18.1755C30.3486 18.2087 30.4372 18.2724 30.5312 18.3665L34.084 21.8196C34.1504 21.8915 34.203 21.9662 34.2417 22.0437C34.2804 22.1156 34.2998 22.2014 34.2998 22.301C34.2998 22.4892 34.2334 22.6441 34.1006 22.7659C33.9733 22.8876 33.8156 22.9485 33.6274 22.9485C33.4282 22.9485 33.2622 22.8738 33.1294 22.7244L31.3281 20.8318L30.6724 20.1511L30.7305 21.72V32.8596C30.7305 33.0533 30.6585 33.2221 30.5146 33.366C30.3708 33.5043 30.1992 33.5735 30 33.5735Z"
                        fill="#CFCAC9"
                    />
                </svg>
            ),
        },
        {
            titleKey: 'pwa.ios.step2.title',
            descriptionKey: 'pwa.ios.step2.description',
            icon: (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="12" fill="#392E2C" />
                    <path
                        d="M24.1772 38.728C22.2485 38.728 21.272 37.7637 21.272 35.8594V24.1528C21.272 22.2363 22.2485 21.272 24.1772 21.272H35.8228C37.7637 21.272 38.728 22.2485 38.728 24.1528V35.8594C38.728 37.7637 37.7637 38.728 35.8228 38.728H24.1772ZM24.2017 37.373H35.7983C36.7993 37.373 37.373 36.8359 37.373 35.7861V24.2261C37.373 23.1763 36.7993 22.627 35.7983 22.627H24.2017C23.1885 22.627 22.627 23.1763 22.627 24.2261V35.7861C22.627 36.8359 23.1885 37.373 24.2017 37.373ZM29.9878 34.5288C29.5483 34.5288 29.292 34.1992 29.292 33.7354V30.6958H26.1304C25.6665 30.6958 25.3247 30.4395 25.3247 30C25.3247 29.5483 25.6421 29.2798 26.1304 29.2798H29.292V26.106C29.292 25.6299 29.5483 25.3125 29.9878 25.3125C30.4395 25.3125 30.708 25.6177 30.708 26.106V29.2798H33.8818C34.3701 29.2798 34.6753 29.5483 34.6753 30C34.6753 30.4395 34.3457 30.6958 33.8818 30.6958H30.708V33.7354C30.708 34.2236 30.4395 34.5288 29.9878 34.5288Z"
                        fill="#CFCAC9"
                    />
                </svg>
            ),
        },
        {
            titleKey: 'pwa.ios.step3.title',
            descriptionKey: 'pwa.ios.step3.description',
            icon: (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="12" fill="#392E2C" />
                    <path
                        d="M24.1772 38.728C22.2485 38.728 21.272 37.7637 21.272 35.8594V24.1528C21.272 22.2363 22.2485 21.272 24.1772 21.272H35.8228C37.7637 21.272 38.728 22.2485 38.728 24.1528V35.8594C38.728 37.7637 37.7637 38.728 35.8228 38.728H24.1772ZM24.2017 37.373H35.7983C36.7993 37.373 37.373 36.8359 37.373 35.7861V24.2261C37.373 23.1763 36.7993 22.627 35.7983 22.627H24.2017C23.1885 22.627 22.627 23.1763 22.627 24.2261V35.7861C22.627 36.8359 23.1885 37.373 24.2017 37.373ZM28.7915 34.7607C28.5107 34.7607 28.291 34.6509 28.0591 34.3701L25.3003 30.9888C25.166 30.8301 25.0928 30.647 25.0928 30.4517C25.0928 30.061 25.3979 29.7681 25.7642 29.7681C25.9961 29.7681 26.2036 29.8657 26.3867 30.1099L28.7549 33.0884L33.2349 25.9839C33.3813 25.7275 33.6011 25.5933 33.8208 25.5933C34.1748 25.5933 34.5288 25.8374 34.5288 26.228C34.5288 26.4111 34.4312 26.6064 34.3213 26.7651L29.4751 34.3701C29.3042 34.6387 29.0723 34.7607 28.7915 34.7607Z"
                        fill="#CFCAC9"
                    />
                </svg>
            ),
        },
    ];

    // iOS Step Component
    const IOSStepItem = ({ step, isLast }: { step: (typeof iosSteps)[0]; isLast: boolean }) => (
        <div className={`flex items-center py-4 rounded-sm ${isLast ? 'mb-6' : 'mb-4'}`}>
            <div className="w-12 h-12 flex items-center justify-center rounded-full mr-4 flex-shrink-0">
                {step.icon}
            </div>
            <div>
                <h3 className="text-white font-['Sora'] font-semibold text-base mb-1">{t(step.titleKey)}</h3>
                <p className="text-[var(--color-shades-80)] font-['Sora'] text-sm">{t(step.descriptionKey)}</p>
            </div>
        </div>
    );

    // Render nothing if the app is already installed or if the banner shouldn't be shown
    if (isStandalone || !(showBanner || showIOSInstructions)) {
        return null;
    }

    return (
        <>
            {/* Main Install Banner */}
            {showBanner && !showIOSInstructions && (
                <div
                    className={`fixed z-50 bg-[var(--color-shades-5)] transition-all duration-300 ease-in-out ${isMobile ? 'top-0 left-0 right-0 p-4 shadow-md' : 'left-6 top-6 max-w-xs rounded-md shadow-2xl'
                        } ${className}`}
                >
                    <div className={`${isMobile ? 'max-w-full mx-auto w-full' : 'p-4'}`}>
                        {isMobile ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src="/icons/icon-48x48.png"
                                        width={44}
                                        height={44}
                                        alt="clink"
                                        onLoad={() => setIsLogoLoaded(true)}
                                        className={`${isLogoLoaded ? 'loaded' : ''} mr-3 rounded-md`}
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg text-[var(--color-shades-100)]">
                                            {title || t('pwa.install.title')}
                                        </h3>
                                        <p className="text-sm text-[var(--color-shades-80)]">
                                            {description || t('pwa.install.description')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={handleDismiss}
                                        className="mr-2 text-[var(--color-shades-70)] hover:text-[var(--color-shades-90)] transition-colors"
                                        aria-label="Close"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    </button>
                                    {isIOS ? (
                                        <button
                                            onClick={handleIOSTutorial}
                                            className="bg-[var(--color-cta)] hover:bg-[var(--color-cta)] hover:opacity-90 text-white py-2 px-6 rounded-md text-sm font-semibold transition-all whitespace-nowrap"
                                        >
                                            {t('pwa.install.howTo')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                // Track install button click
                                                trackPWAInstallResponse(
                                                    'accepted',
                                                    walletAddress || undefined,
                                                    'install_banner',
                                                );
                                                promptInstall(walletAddress || undefined);
                                            }}
                                            className="bg-[var(--color-cta)] hover:bg-[var(--color-cta)] hover:opacity-90 text-white py-2 px-6 rounded-md text-sm font-semibold transition-all"
                                        >
                                            {t('pwa.install.button')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 mr-2 flex items-center justify-center bg-[var(--color-cta-4)] rounded-full">
                                            <svg
                                                className="w-5 h-5 text-[var(--color-cta)]"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-lg text-[var(--color-shades-100)]">
                                            {title || t('pwa.install.title')}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={handleDismiss}
                                        className="text-[var(--color-shades-70)] hover:text-[var(--color-shades-90)] transition-colors"
                                        aria-label="Close"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-[var(--color-shades-80)] mb-4">
                                    {description || t('pwa.install.description')}
                                </p>
                                <div>
                                    {isIOS ? (
                                        <button
                                            onClick={handleIOSTutorial}
                                            className="w-full bg-[var(--color-cta)] hover:bg-[var(--color-cta)] hover:opacity-90 text-white py-2 px-4 rounded-md text-sm font-semibold transition-all"
                                        >
                                            {t('pwa.install.howTo')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                // Track install button click
                                                trackPWAInstallResponse(
                                                    'accepted',
                                                    walletAddress || undefined,
                                                    'install_banner',
                                                );
                                                promptInstall(walletAddress || undefined);
                                            }}
                                            className="w-full bg-[var(--color-cta)] hover:bg-[var(--color-cta)] hover:opacity-90 text-white py-2 px-4 rounded-md text-sm font-semibold transition-all"
                                        >
                                            {t('pwa.install.button')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* iOS Installation Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-[var(--color-shades-blur-10)]"
                        style={{
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                        }}
                        onClick={toggleIOSInstructions}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full h-full flex flex-col px-6">
                        {/* Modal Header */}
                        <div className="flex-shrink-0 flex justify-between items-center py-4 w-full border-b border-[var(--color-cta-3)]">
                            <h2 className="text-white font-['Sora'] font-semibold text-4xl">{t('pwa.ios.title')}</h2>
                            <button
                                onClick={toggleIOSInstructions}
                                className="p-2 hover:bg-[var(--color-cta-5)] rounded-full transition-colors"
                            >
                                <svg
                                    className="w-6 h-6 text-[var(--color-shades-70)]"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 pt-6">
                            {iosSteps.map((step, index) => (
                                <IOSStepItem key={index} step={step} isLast={index === iosSteps.length - 1} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
