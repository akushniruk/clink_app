import { useState, useEffect, useCallback, useMemo } from 'preact/hooks';
import { memo } from 'preact/compat';
import { useLoginState } from '../../hooks/useLoginState';
import { useT } from '../../i18n';
import { usePaymentFlow } from '../../hooks/usePaymentFlow';
import { useMultiSessionStorage } from '../../hooks/useSessionStorage';
import { PaymentFlowRouter, PaymentFlowLoadingFallback, type PaymentFlowView } from '../shared/PaymentFlowRouter';
import { Background } from '../ui/Background';
import type { ShareLinkParams } from '../../hooks/useShareLinkParams';
import { trackBarJourneyStep } from '../../utils/analytics';
import { config } from '../../utils/env';

type TransferView = 'recipient' | PaymentFlowView;

interface SharedLinkTransferProps {
    shareParams: ShareLinkParams;
    onClose: () => void;
}

const SharedLinkTransferComponent = ({ shareParams, onClose }: SharedLinkTransferProps) => {
    const t = useT();
    const { walletAddress } = useLoginState();

    // Session storage for persistent state
    const [sessionState, setSessionValue, clearSessionState] = useMultiSessionStorage('sharedLinkTransfer', {
        currentView: 'recipient' as TransferView,
        paymentAmount: shareParams.amount || '',
    });

    // Payment flow state management
    const paymentFlow = usePaymentFlow({
        initialAmount: sessionState.paymentAmount,
        onSuccess: () => {
            setCurrentView('success');
            setSessionValue('currentView', 'success');
        },
        onFailure: () => {
            setCurrentView('failure');
            setSessionValue('currentView', 'failure');
        },
    });

    const [currentView, setCurrentView] = useState<TransferView>(sessionState.currentView);

    // Memoized recipient data to prevent unnecessary re-computations
    const { recipientAddress, linkType } = useMemo(() => {
        const address = shareParams.recipientAddress || shareParams.recipientTag || '';
        const type = shareParams.recipientTag ? 'tag' : 'address';
        return { recipientAddress: address, linkType: type };
    }, [shareParams.recipientAddress, shareParams.recipientTag]);

    // Auto-navigate based on available data
    useEffect(() => {
        if (recipientAddress && currentView === 'recipient') {
            trackBarJourneyStep('shared_link_opened', 0, walletAddress || undefined, {
                recipient_address: recipientAddress,
                has_preset_amount: !!shareParams.amount,
                link_type: linkType,
            });

            const newView = shareParams.amount ? 'confirmation' : 'amount';
            setCurrentView(newView);
            setSessionValue('currentView', newView);
        }
    }, [recipientAddress, shareParams.amount, linkType, walletAddress, setSessionValue]);

    // Clear session state and close
    const handleClose = useCallback(() => {
        clearSessionState();
        onClose();
    }, [clearSessionState, onClose]);

    const handleBackToAmount = useCallback(() => {
        setCurrentView('amount');
        setSessionValue('currentView', 'amount');
    }, [setSessionValue]);

    const handleAmountComplete = useCallback(
        (amount: string) => {
            paymentFlow.setPaymentAmount(amount);
            setCurrentView('confirmation');
            setSessionValue('currentView', 'confirmation');
            setSessionValue('paymentAmount', amount);
        },
        [paymentFlow, setSessionValue],
    );

    const handleConfirmPayment = useCallback(async () => {
        const result = await paymentFlow.handleConfirmPayment(recipientAddress, {
            eventName: 'shared_link_payment_confirmed',
            stepNumber: 1,
            paymentMethod: 'shared_link_transfer',
            additionalData: { link_type: linkType },
        });

        return result;
    }, [paymentFlow, recipientAddress, linkType]);

    const handleRetryPayment = useCallback(() => {
        setCurrentView('confirmation');
        setSessionValue('currentView', 'confirmation');
        paymentFlow.setErrorMessage('');
    }, [paymentFlow, setSessionValue]);

    const handlePaymentSuccess = useCallback(() => {
        trackBarJourneyStep('shared_link_session_completed', 2, walletAddress || undefined, {
            recipient_address: recipientAddress,
            amount: parseInt(paymentFlow.paymentAmount, 10),
            currency: config.asset,
            transaction_id: paymentFlow.transactionId,
            link_type: linkType,
        });

        handleClose();
    }, [recipientAddress, paymentFlow.paymentAmount, paymentFlow.transactionId, walletAddress, linkType, handleClose]);

    switch (currentView) {
        case 'recipient':
            return (
                <div className="fixed inset-0 z-50 bg-black overflow-hidden">
                    <Background />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-4">{t('transfer.sharedLink.title')}</h2>
                            <p className="text-gray-300 mb-8">{t('transfer.sharedLink.description')}</p>
                            <div className="w-8 h-8 border-2 border-[var(--color-cta)] border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    </div>
                </div>
            );

        case 'amount':
        case 'confirmation':
        case 'success':
        case 'failure':
            return (
                <PaymentFlowRouter
                    currentView={currentView}
                    recipientAddress={recipientAddress}
                    paymentAmount={paymentFlow.paymentAmount}
                    transactionId={paymentFlow.transactionId}
                    errorMessage={paymentFlow.errorMessage}
                    onBackToAmount={handleBackToAmount}
                    onBackToPrevious={handleClose}
                    onAmountComplete={handleAmountComplete}
                    onConfirmPayment={handleConfirmPayment}
                    onRetryPayment={handleRetryPayment}
                    onCancelPayment={handleClose}
                    onPaymentSuccess={handlePaymentSuccess}
                    loadingFallback={<PaymentFlowLoadingFallback message="Loading payment flow..." />}
                />
            );

        default:
            return null;
    }
};

// Memoize component to prevent unnecessary re-renders
export const SharedLinkTransfer = memo(SharedLinkTransferComponent);
