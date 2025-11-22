import { useState, useMemo, useCallback, useEffect, useRef } from 'preact/hooks';
import { UserQRCode, QrScanner, ManualEntry } from '../components/user';
import { useLoginState } from '../hooks/useLoginState';
import { Background } from '../components/ui/Background';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { PaymentFlowRouter, type PaymentFlowView } from '../components/shared/PaymentFlowRouter';
import { useGetLedgerBalances } from '../hooks/useGetLedgerBalances';
import AssetsStore from '../store/AssetsStore';
import { useSnapshot } from 'valtio';
import { Header, AccountModal, TabButton } from '../components';
import { PayButton, PayByTagButton, QRCodeSkeleton, BalanceDisplay, TransactionHistory } from '../components/ui';
import { config } from '../utils/env';
import { useT } from '../i18n';
import { usePrivy } from '@privy-io/react-auth';
import {
    trackPageView,
    trackBarJourneyStep,
    trackFeatureUsed,
    trackPaymentInitiated,
    trackAccountDetailsViewed,
    trackLogout,
} from '../utils/analytics';
import { useGetLedgerTransactions } from '../hooks/useGetLedgerTransactions.ts';
import { useGetUserTag } from '../hooks/useGetUserTag.ts';
import UserTagStore from '../store/UserTagStore.ts';
import { useShareLinkParams } from '../hooks/useShareLinkParams';
import { lazy, Suspense } from 'preact/compat';
import 'react-loading-skeleton/dist/skeleton.css';
import NotificationStore from '../store/NotificationStore.ts';
import { RPCTxType, type RPCTransaction } from '@erc7824/nitrolite';

// Lazy load SharedLinkTransfer to reduce initial bundle
const SharedLinkTransfer = lazy(() =>
    import('../components/transfer/SharedLinkTransfer').then((m) => ({ default: m.SharedLinkTransfer })),
);

type ViewMode = 'home' | 'scanner' | 'manual' | 'manual-shortcut' | PaymentFlowView;
type TabMode = 'balance' | 'history';

const MainContent = () => {
    const t = useT();
    const { walletAddress } = useLoginState();
    const assetsState = useSnapshot(AssetsStore.state);
    const userTagState = useSnapshot(UserTagStore.state);
    const notificationState = useSnapshot(NotificationStore.state);
    const { logout } = usePrivy();
    const shareParams = useShareLinkParams();

    // Payment flow state management
    const paymentFlow = usePaymentFlow({
        onSuccess: () => setCurrentView('success'),
        onFailure: () => setCurrentView('failure'),
    });

    // Initialize hooks
    const { getLedgerBalances } = useGetLedgerBalances();
    const { getLedgerTransactions } = useGetLedgerTransactions();
    const { getUserTag } = useGetUserTag();

    const [currentView, setCurrentView] = useState<ViewMode>('home');
    const [activeTab, setActiveTab] = useState<TabMode>('balance');
    const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
    const [scannedAddress, setScannedAddress] = useState<string>('');
    const [showSharedLinkTransfer, setShowSharedLinkTransfer] = useState<boolean>(false);
    const [paymentSource, setPaymentSource] = useState<'scanner' | 'manual' | 'history'>('scanner');

    // Track last balance fetch time for throttling
    const lastBalanceFetchTime = useRef<number>(0);

    // Fetch user tag when component mounts if not already loaded
    useEffect(() => {
        if (!userTagState.userTag && !userTagState.loading && walletAddress) {
            getUserTag();
        }
    }, [walletAddress, getUserTag, userTagState.userTag, userTagState.loading]);

    // Track page view when component mounts
    useEffect(() => {
        trackPageView('home_page', walletAddress || undefined);
    }, [walletAddress]);

    // Handle shared link detection (only run once on mount)
    useEffect(() => {
        // Only show shared link transfer if user is authenticated and we have a payment request
        if (walletAddress && shareParams.isPaymentRequest) {
            setShowSharedLinkTransfer(true);
        }
    }, [shareParams.isPaymentRequest]); // Removed walletAddress from deps to prevent re-mounting

    // Fetch history when history tab is opened
    useEffect(() => {
        if (activeTab === 'history') {
            getLedgerTransactions();
        }
    }, [activeTab, getLedgerTransactions]);

    // Helper function for throttled balance fetching
    const fetchBalancesThrottled = useCallback(() => {
        const now = Date.now();
        if (now - lastBalanceFetchTime.current >= 60000) {
            // Throttle to max once per second
            lastBalanceFetchTime.current = now;
            getLedgerBalances();
        }
    }, [getLedgerBalances]);

    // Fetch balances when balance tab is active and set up 5-second intervals
    useEffect(() => {
        if (activeTab === 'balance') {
            // Fetch immediately when tab opens
            fetchBalancesThrottled();

            // Set up 5-second interval for refetching
            const interval = setInterval(fetchBalancesThrottled, 5000);

            return () => clearInterval(interval);
        }
    }, [activeTab, fetchBalancesThrottled]);

    // Memoized Assets balance calculation
    const balance = useMemo(() => {
        // If we have no balance data, return default
        if (!assetsState.ledgerBalances || assetsState.ledgerBalances.length === 0) {
            return { amount: '0', asset: config.asset };
        }

        // Use the first available balance (most likely the primary asset)
        const primaryBalance = assetsState.ledgerBalances[0];

        return {
            amount: primaryBalance.amount ?? '0',
            asset: config.asset,
        };
    }, [assetsState.ledgerBalances]);

    // Refetch data when balance changes
    useEffect(() => {
        // Only refetch if we're on history tab and balance has actually changed
        if (activeTab === 'history') {
            getLedgerTransactions();
        }
    }, [balance.amount, activeTab, getLedgerTransactions]);

    // Memoized navigation handlers
    const handleScanSuccess = useCallback(
        (address: string) => {
            // Track payment initiated via QR scan
            trackPaymentInitiated('qr_scan', walletAddress || undefined);

            // Track QR scan success (legacy event)
            trackBarJourneyStep('qr_scanned', 1, walletAddress || undefined, {
                scanned_address: address,
                scanner_type: 'camera',
            });
            setScannedAddress(address);
            setPaymentSource('scanner');
            setCurrentView('amount');
        },
        [walletAddress],
    );

    const handleManualSuccess = useCallback(
        (address: string) => {
            // Track payment initiated via manual entry
            trackPaymentInitiated('manual_entry', walletAddress || undefined);

            // Track manual entry success (use qr_scanned event for consistency)
            trackBarJourneyStep('qr_scanned', 1, walletAddress || undefined, {
                scanned_address: address,
                scanner_type: 'manual',
            });
            setScannedAddress(address);
            setPaymentSource('manual');
            setCurrentView('amount');
        },
        [walletAddress],
    );

    const handlePayClick = useCallback(() => {
        // Track pay button click
        trackFeatureUsed('pay_button_clicked', walletAddress || undefined, {
            balance: balance.amount,
            asset: balance.asset,
            dev_mode: config.isDev,
        });

        // Dev mode bypass - automatically use test address
        if (config.isDev) {
            const devAddress = import.meta.env.VITE_DEV_ADDRESS || '0xd955F5Cdee0DE471c64Ab648E1878804ba5FEA12';
            handleScanSuccess(devAddress);
        } else {
            setCurrentView('scanner');
        }
    }, [handleScanSuccess, walletAddress, balance]);
    const handlePayByTagClick = useCallback(() => {
        // Track pay button click
        trackFeatureUsed('pay_button_clicked', walletAddress || undefined, {
            balance: balance.amount,
            asset: balance.asset,
            dev_mode: config.isDev,
        });

        setCurrentView('manual-shortcut');
    }, [walletAddress, balance]);
    const handleScanError = useCallback((error: Error) => {
        console.error('QR scan error:', error);
        // Error handling is now done within QrScanner component with better UI
    }, []);
    const handleBackToScanner = useCallback(() => setCurrentView('scanner'), []);
    const handleBackToHome = useCallback(() => setCurrentView('home'), []);
    const handleBackToHistory = useCallback(() => {
        setActiveTab('history');
        setCurrentView('home');
    }, []);
    const handleSwitchToManual = useCallback(() => setCurrentView('manual'), []);
    const handleSwitchToScanner = useCallback(() => setCurrentView('scanner'), []);

    // Dynamic back handler based on payment source
    const handleBackToPrevious = useCallback(() => {
        switch (paymentSource) {
            case 'history':
                return handleBackToHistory();
            case 'manual':
                return handleBackToHome();
            case 'scanner':
            default:
                return handleBackToScanner();
        }
    }, [paymentSource, handleBackToHistory, handleBackToHome, handleBackToScanner]);
    const handleProceedToConfirmation = useCallback(
        (amount: string) => {
            paymentFlow.setPaymentAmount(amount);
            setCurrentView('confirmation');
        },
        [paymentFlow],
    );
    const handleBackToAmount = useCallback(() => setCurrentView('amount'), []);

    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

    const handleConfirmPayment = useCallback(async () => {
        if (isConfirmingPayment) {
            console.log('Payment confirmation already in progress, ignoring duplicate call');
            return { success: false, error: 'Payment already in progress' };
        }

        setIsConfirmingPayment(true);
        try {
            const result = await paymentFlow.handleConfirmPayment(scannedAddress, {
                eventName: 'payment_confirmed',
                stepNumber: 2,
                paymentMethod: 'wallet_transfer',
            });

            // View changes are handled by the payment flow callbacks
            return result;
        } finally {
            setIsConfirmingPayment(false);
        }
    }, [paymentFlow, scannedAddress, isConfirmingPayment]);

    const resetPaymentState = useCallback(() => {
        setScannedAddress('');
        setPaymentSource('scanner');
        paymentFlow.resetPaymentState();
    }, [paymentFlow]);

    const handleRetryPayment = useCallback(() => {
        setCurrentView('confirmation');
        paymentFlow.setErrorMessage('');
    }, [paymentFlow]);

    const handleCancelPayment = useCallback(() => {
        setCurrentView('home');
        resetPaymentState();
    }, [resetPaymentState]);

    const handlePaymentSuccess = useCallback(() => {
        // Track session completion
        trackBarJourneyStep('session_completed', 3, walletAddress || undefined, {
            recipient_address: scannedAddress,
            amount: parseInt(paymentFlow.paymentAmount, 10),
            currency: config.asset,
            transaction_id: paymentFlow.transactionId,
        });

        setCurrentView('home');
        resetPaymentState();
    }, [resetPaymentState, walletAddress, scannedAddress, paymentFlow.paymentAmount, paymentFlow.transactionId]);

    const handlePayBack = useCallback(
        (participantTag: string) => {
            // Track payback initiation
            trackFeatureUsed('payback_initiated', walletAddress || undefined, {
                participant_tag: participantTag,
            });

            // Use existing payment flow with user tag
            setScannedAddress(participantTag);
            setPaymentSource('history');
            setCurrentView('amount');
        },
        [walletAddress],
    );

    const handleAccountClick = useCallback(() => {
        // Track account details viewed
        trackAccountDetailsViewed(walletAddress || undefined);

        // Track legacy account modal opening
        trackFeatureUsed('account_modal_opened', walletAddress || undefined, {
            current_balance: balance.amount,
            asset: balance.asset,
        });
        setIsAccountModalOpen(true);
    }, [walletAddress, balance]);

    const handleAccountModalClose = useCallback(() => {
        setIsAccountModalOpen(false);
    }, []);

    const handleLogout = useCallback(async () => {
        // Track logout event
        trackLogout(walletAddress || undefined);

        // Reset login state and close modal
        setIsAccountModalOpen(false);
        resetPaymentState();
        await logout(); // Call Privy logout
        window.localStorage.removeItem('jwt_token');
        window.localStorage.removeItem('bw_session_key');
        // You can add additional logout logic here
        window.location.reload(); // Simple logout by reloading the page
    }, [resetPaymentState, walletAddress]);

    const handleCloseSharedLinkTransfer = useCallback(() => {
        setShowSharedLinkTransfer(false);
    }, []);

    // View router function
    const renderView = () => {
        switch (currentView) {
            case 'scanner':
                return (
                    <QrScanner
                        onScan={handleScanSuccess}
                        onError={handleScanError}
                        onClose={handleBackToHome}
                        onManualEntry={handleSwitchToManual}
                    />
                );

            case 'manual-shortcut':
                return <ManualEntry onAddressSubmit={handleManualSuccess} onSwitchToScan={handleBackToHome} />;

            case 'manual':
                return <ManualEntry onAddressSubmit={handleManualSuccess} onSwitchToScan={handleSwitchToScanner} />;

            case 'amount':
            case 'confirmation':
            case 'success':
            case 'failure':
                return (
                    <PaymentFlowRouter
                        currentView={currentView}
                        recipientAddress={scannedAddress}
                        paymentAmount={paymentFlow.paymentAmount}
                        transactionId={paymentFlow.transactionId}
                        errorMessage={paymentFlow.errorMessage}
                        onBackToAmount={handleBackToAmount}
                        onBackToPrevious={handleBackToPrevious}
                        onAmountComplete={handleProceedToConfirmation}
                        onConfirmPayment={handleConfirmPayment}
                        onRetryPayment={handleRetryPayment}
                        onCancelPayment={handleCancelPayment}
                        onPaymentSuccess={handlePaymentSuccess}
                    />
                );

            default:
                return null;
        }
    };

    const renderAlert = useCallback(
        (notification: RPCTransaction) => {
            switch (notification.txType) {
                case RPCTxType.Transfer:
                    // Determine if this is a received or sent transaction
                    const isReceived = notification.toAccount === walletAddress;
                    const translationKey = isReceived
                        ? 'notifications.transfer.received'
                        : 'notifications.transfer.sent';

                    // Get the appropriate participant (sender or receiver)
                    const participant = isReceived
                        ? notification.fromAccountTag || notification.fromAccount
                        : notification.toAccountTag || notification.toAccount;

                    return (
                        <div
                            key={notification.id}
                            className="notification-card w-[calc(100vw-16px)] bg-gradient-to-r from-[var(--color-base-green)] to-[var(--color-base-green)] rounded-2xl m-2 flex p-4 items-center justify-between shadow-lg backdrop-blur-sm border border-[var(--color-shades-40)] cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                            onClick={() => {
                                NotificationStore.dropNotification(notification.id);
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-shades-0)] flex items-center justify-center">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="text-[var(--color-base-green)]">
                                        <path
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[var(--color-shades-0)] font-semibold text-sm">Success!</span>
                                    <span className="text-[var(--color-shades-10)] text-xs">
                                        {isReceived
                                            ? t(translationKey, {
                                                amount: notification.amount,
                                                asset: notification.asset,
                                                sender: participant,
                                            })
                                            : t(translationKey, {
                                                amount: notification.amount,
                                                asset: notification.asset,
                                                receiver: participant,
                                            })}
                                    </span>
                                </div>
                            </div>
                            <div className="text-[var(--color-shades-0)] opacity-60 text-xs">✕</div>
                            <div className="absolute bottom-0 left-0 h-1 bg-[var(--color-shades-0)] opacity-20 rounded-b-2xl notification-progress"></div>
                        </div>
                    );
                default:
                    // Handle other notification types if needed
                    return null;
            }
        },
        [walletAddress],
    );

    const renderAlerts = useMemo(() => {
        return <div class="notification-container">{NotificationStore.getSortedNotifications().map(renderAlert)}</div>;
    }, [notificationState.notifications, renderAlert]);

    // Show shared link transfer if detected
    if (showSharedLinkTransfer && shareParams.isPaymentRequest) {
        return (
            <Suspense
                fallback={
                    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[var(--color-cta)] border-t-transparent rounded-full animate-spin" />
                    </div>
                }>
                <SharedLinkTransfer shareParams={shareParams} onClose={handleCloseSharedLinkTransfer} />
            </Suspense>
        );
    }

    const viewComponent = renderView();
    if (viewComponent) return viewComponent;

    return (
        <>
            <Background />
            {renderAlerts}
            <div className="fixed inset-0 flex flex-col h-screen overflow-hidden z-50">
                {/* Account Modal */}
                <AccountModal
                    isOpen={isAccountModalOpen}
                    onClose={handleAccountModalClose}
                    walletAddress={walletAddress || null}
                    onLogout={handleLogout}
                />

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-h-0 gap-4">
                    {/* Header */}
                    <div className="flex-shrink-0 px-4 pt-4">
                        <Header onAccountClick={handleAccountClick} />
                    </div>
                    {/* QR Code Section */}
                    <div className="flex justify-center flex-shrink-0 px-4">
                        {userTagState.userTag ? <UserQRCode userId={userTagState.userTag} /> : <QRCodeSkeleton />}
                    </div>
                    {/* w-full pt-6 bg-body-background-color mb-0 md:mb-[84px] overflow-y-auto border-t-2 border-neutral-control-color-60 cr-assets-shadow rounded-t-3xl flex flex-col h-full */}
                    {/* Main Card - Fixed Height */}
                    <div className="flex-1 bg-[var(--color-shades-5)] border-t-2 border-[var(--color-shades-30)] rounded-t-3xl flex flex-col overflow-hidden min-h-0">
                        {/* Tab Headers */}
                        <div className="flex border-b border-[var(--color-shades-20)] flex-shrink-0">
                            <TabButton
                                isActive={activeTab === 'balance'}
                                onClick={() => {
                                    trackFeatureUsed('balance_tab_clicked', walletAddress || undefined);
                                    setActiveTab('balance');
                                }}>
                                {t('history.balance')}
                            </TabButton>
                            <TabButton
                                isActive={activeTab === 'history'}
                                onClick={() => {
                                    trackFeatureUsed('history_tab_clicked', walletAddress || undefined);
                                    setActiveTab('history');
                                }}>
                                {t('history.title')}
                            </TabButton>
                        </div>

                        {/* Tab Content - Fixed Height */}
                        <div className="flex-1 min-h-0">
                            {activeTab === 'balance' ? (
                                /* Balance Tab - No Scroll, Full Height */
                                <div className="h-full flex flex-col py-6">
                                    {/* Balance Display - Centered */}
                                    <div className="flex-1 flex items-center justify-center px-4">
                                        <BalanceDisplay
                                            balance={balance}
                                            isLoading={assetsState.ledgerBalancesLoading}
                                            isFirstLoad={assetsState.isFirstBalanceLoad}
                                        />
                                    </div>

                                    {/* Pay Button - Bottom */}
                                    <div className="flex flex-col gap-2 mb-0 ios:mb-14 px-4">
                                        <div className="flex-shrink-0 ">
                                            <PayButton onClick={handlePayClick} />
                                        </div>
                                        <div className="flex-shrink-0">
                                            <PayByTagButton onClick={handlePayByTagClick} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* History Tab - Scrollable Content */
                                <div className="h-full flex flex-col">
                                    <TransactionHistory
                                        walletAddress={walletAddress || null}
                                        onPayBack={handlePayBack}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const HomePage = () => {
    return <MainContent />;
};
