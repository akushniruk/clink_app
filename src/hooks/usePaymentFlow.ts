import { useState, useCallback } from 'preact/hooks';
import { useLoginState } from './useLoginState';
import { useTransfer } from './useTransfer';
import { trackPaymentConfirmed, trackPaymentFailed } from '../utils/analytics';
import { config as envConfig } from '../utils/env';

export interface PaymentFlowState {
    paymentAmount: string;
    transactionId: string;
    errorMessage: string;
}

export interface PaymentFlowActions {
    setPaymentAmount: (amount: string) => void;
    setTransactionId: (id: string) => void;
    setErrorMessage: (message: string) => void;
    resetPaymentState: () => void;
    handleConfirmPayment: (
        recipientAddress: string,
        analytics: {
            eventName: string;
            stepNumber: number;
            paymentMethod: string;
            additionalData?: Record<string, any>;
        },
    ) => Promise<{ success: boolean; error?: string }>;
}

export interface PaymentFlowConfig {
    initialAmount?: string;
    onSuccess?: () => void;
    onFailure?: () => void;
}

export const usePaymentFlow = (config: PaymentFlowConfig = {}): PaymentFlowState & PaymentFlowActions => {
    const { walletAddress } = useLoginState();
    const { handleTransfer } = useTransfer();

    const [paymentAmount, setPaymentAmount] = useState<string>(config.initialAmount || '');
    const [transactionId, setTransactionId] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const resetPaymentState = useCallback(() => {
        setPaymentAmount(config.initialAmount || '');
        setTransactionId('');
        setErrorMessage('');
    }, [config.initialAmount]);

    const handleConfirmPayment = useCallback(
        async (
            recipientAddress: string,
            analytics: {
                eventName: string;
                stepNumber: number;
                paymentMethod: string;
                additionalData?: Record<string, any>;
            },
        ) => {
            try {
                const result = await handleTransfer(recipientAddress as `0x${string}`, paymentAmount);

                if (result.success) {
                    // Generate transaction ID
                    const txId = `0x${Date.now().toString(16).padStart(8, '0')}`;
                    setTransactionId(txId);

                    // Track successful payment confirmation
                    trackPaymentConfirmed(
                        analytics.additionalData?.session_id || `session_${Date.now()}`,
                        txId,
                        walletAddress || undefined,
                        {
                            recipient_address: recipientAddress,
                            value: parseInt(paymentAmount, 10),
                            currency: envConfig.asset,
                            method: analytics.paymentMethod as any,
                            ...analytics.additionalData,
                        },
                    );

                    // Call success callback if provided
                    config?.onSuccess?.();

                    return { success: true };
                } else {
                    const error = result.error || 'Transaction failed';
                    setErrorMessage(error);

                    // Track payment failure
                    trackPaymentFailed(
                        analytics.additionalData?.session_id || `session_${Date.now()}`,
                        error,
                        walletAddress || undefined,
                    );

                    config?.onFailure?.();
                    return { success: false, error };
                }
            } catch (error) {
                console.error('Payment failed:', error);
                const errorMsg = error instanceof Error ? error.message : 'Transaction failed';
                setErrorMessage(errorMsg);

                // Track payment failure
                trackPaymentFailed(
                    analytics.additionalData?.session_id || `session_${Date.now()}`,
                    errorMsg,
                    walletAddress || undefined,
                );

                config?.onFailure?.();
                return { success: false, error: errorMsg };
            }
        },
        [handleTransfer, paymentAmount, walletAddress, config],
    );

    return {
        paymentAmount,
        transactionId,
        errorMessage,
        setPaymentAmount,
        setTransactionId,
        setErrorMessage,
        resetPaymentState,
        handleConfirmPayment,
    };
};
