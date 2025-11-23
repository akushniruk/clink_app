import { MobileOnlyGuard } from './components/ui';
import { HomePage } from './pages/HomePage';
import { AccountPage } from './pages/AccountPage';
import { CharityDetailPage } from './pages/CharityDetailPage';
import { CreateCharityPage } from './pages/CreateCharityPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingStories } from './components/onboarding';
import { InstallBanner } from './components/pwa/InstallBanner';
import { useFirstTimeUser } from './hooks/useFirstTimeUser';
import { useLoginState } from './hooks/useLoginState';
import { TranslationProvider, useTranslation } from './i18n';
import ClientProviders from './components/web3/ClientProviders';
import { WalletClientProvider } from './components/web3/WalletClientContext';
import { YellowWebSocketProvider } from './components/yellow/YellowWebSocketProvider';
import { useEffect } from 'preact/hooks';
import { initializeAnalytics } from './utils/analytics';
import { setupPWATracking } from './utils/pwaTracking';
import { initializeWebVitals } from './utils/webVitals';
import { useNotifications } from './hooks/useNotifications';
import { type RPCTransaction as Notification } from '@erc7824/nitrolite';
import Router from 'preact-router';

const AppContent = () => {
    const { isFirstTime, isLoading, markOnboardingComplete } = useFirstTimeUser();
    const { isWalletReady, isReady, walletAddress } = useLoginState();
    const { t, isLoading: isTranslationLoading } = useTranslation();

    // Initialize analytics when user is authenticated
    useEffect(() => {
        if (isWalletReady && walletAddress) {
            initializeAnalytics(walletAddress);
        }
    }, [isWalletReady, walletAddress]);

    // Setup PWA tracking
    useEffect(() => {
        const cleanup = setupPWATracking(walletAddress || undefined);
        return cleanup;
    }, [walletAddress]);

    // Initialize Web Vitals tracking
    useEffect(() => {
        initializeWebVitals();
    }, []);

    useNotifications((n: Notification) => {
        console.log('New notification received:', n);
    });

    // Debug logging
    // App state logged

    // Show loading state while checking first-time user status, translations, or Privy readiness
    if (isLoading || isTranslationLoading || !isReady) {
        return (
            <div class="min-h-screen bg-[#000] flex items-center justify-center">
                <div class="text-center">
                    <div class="text-6xl mb-4 animate-pulse">📱</div>
                    <div class="text-gray-300">{t('loading')}</div>
                </div>
            </div>
        );
    }

    return (
        <MobileOnlyGuard>
            <>
                {isFirstTime && <OnboardingStories onComplete={markOnboardingComplete} />}
                {!isWalletReady && !isFirstTime && <LoginPage />}
                {isWalletReady && !isFirstTime && (
                    <Router>
                        <HomePage path="/" />
                        <CreateCharityPage path="/charity/create" />
                        <CharityDetailPage path="/charity/:id" />
                        <AccountPage path="/account" />
                    </Router>
                )}
                <InstallBanner title={t('pwa.install.title')} description={t('pwa.install.description')} />
            </>
        </MobileOnlyGuard>
    );
};

export const App = () => {
    return (
        <TranslationProvider>
            <ClientProviders>
                <WalletClientProvider>
                    <YellowWebSocketProvider>
                        <AppContent />
                    </YellowWebSocketProvider>
                </WalletClientProvider>
            </ClientProviders>
        </TranslationProvider>
    );
};
