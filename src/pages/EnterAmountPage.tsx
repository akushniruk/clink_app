import { useState, useMemo, useCallback, useEffect } from 'preact/hooks';
import { useSnapshot } from 'valtio';
import { Numpad } from '../components/ui/Numpad';
import { Button } from '../components/ui';
import { formatSignificantWithSeparators } from '../utils/formatters';
import { formatAddress } from '../utils/addressUtils';
import { useT } from '../i18n';
import AssetsStore from '../store/AssetsStore';
import { config } from '../utils/env';
import { UserIcon } from '@heroicons/react/24/solid';
import { trackPaymentFormViewed, trackPaymentFormSubmitted } from '../utils/analytics';

interface EnterAmountPageProps {
    recipientAddress: string;
    charityName?: string;
    onBack: () => void;
    onComplete: (amount: string) => void;
}

export const EnterAmountPage = ({ recipientAddress, charityName, onBack, onComplete }: EnterAmountPageProps) => {
    const t = useT();
    const [amount, setAmount] = useState('');
    const assetsState = useSnapshot(AssetsStore.state);
    const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);

    // Track payment form viewed when component mounts
    useEffect(() => {
        trackPaymentFormViewed(sessionId, recipientAddress);
    }, [sessionId, recipientAddress]);

    // Calculate total Assets balance from ledger balances - memoized
    const availableBalance = useMemo(() => {
        if (!assetsState.ledgerBalances || !assetsState.assets) return '0';

        // Find Assets assets (looking for Assets symbol)
        const assets = assetsState.assets.filter((asset) => asset.symbol === config.asset);

        let totalBalance: number | string = 0;

        // Sum balances for all assets
        assets.forEach((asset) => {
            const balance = assetsState.ledgerBalances?.find(
                (b) => b.asset.toLowerCase() === asset.symbol.toLowerCase(),
            );

            if (balance) {
                totalBalance = balance.amount ?? '0';
            }
        });

        return totalBalance.toString();
    }, [assetsState.ledgerBalances, assetsState.assets]);

    // Check if amount exceeds available balance
    const isExceedingBalance = useMemo(() => {
        if (!amount || !availableBalance) {
            return false;
        }

        try {
            const amountNum = parseInt(amount, 10);
            const balanceNum = parseInt(availableBalance, 10);

            return amountNum > balanceNum;
        } catch (error) {
            console.error('Error comparing amounts:', error);
            return false;
        }
    }, [amount, availableBalance]);

    // Button enabled if: amount is positive AND not exceeding balance
    const canPay = useMemo(() => {
        return !isExceedingBalance;
    }, [amount, isExceedingBalance]);

    const handlePay = useCallback(() => {
        if (!canPay) {
            return;
        }

        // Track payment form submission
        trackPaymentFormSubmitted(sessionId, parseInt(amount, 10), config.asset);

        onComplete(amount);
    }, [amount, canPay, onComplete, sessionId]);

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden">
            <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4">
                    <button onClick={onBack} className="p-4 rounded-sm bg-[var(--color-shades-20)] backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Amount Display - centered in available space */}
                <div className="flex-1 flex flex-col justify-center items-center px-6">
                    {/* Charity Name and Recipient Address */}
                    <div className="mb-14 flex flex-col items-center gap-2">
                        {charityName && (
                            <div className="text-white font-semibold text-lg">{charityName}</div>
                        )}
                        <div className="flex items-center space-x-2 border border-[var(--color-shades-30)] rounded-4xl px-4 py-1.5">
                            <span className="text-sm text-[var(--color-shades-30)] capitalize font-semibold">
                                {t('payment.to')}
                            </span>
                            <UserIcon className="w-5 h-5 text-[var(--color-shades-30)]" />
                            <span className="text-sm text-white font-medium">{formatAddress(recipientAddress)}</span>
                        </div>
                    </div>
                    <div className="flex gap-1 text-white items-start">
                        <span className="text-6xl font-bold">{amount || '0'}</span>
                    </div>

                    {/* Available Balance */}
                    <div className="mt-2 text-sm text-white font-medium uppercase">
                        {t('payment.available')} {formatSignificantWithSeparators(availableBalance)} {config.asset}
                    </div>

                    {/* Error message if exceeding balance */}
                    {isExceedingBalance && (
                        <div className="mt-2 text-sm text-red-400 font-medium">{t('payment.amountExceeds')}</div>
                    )}
                </div>

                {/* Bottom Section - Pay Button + Numpad */}
                <div className="flex-shrink-0">
                    {/* Pay Button */}
                    <div className="px-6 mb-4">
                        <Button onClick={handlePay} disabled={!canPay} variant="primary" size="lg" fullWidth>
                            {t('payment.payAmount')}
                        </Button>
                    </div>

                    {/* Numpad */}
                    <div className="pb-6">
                        <Numpad
                            value={amount}
                            onChange={setAmount}
                            maxLength={8}
                            showDecimal={true}
                            className="max-w-sm mx-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
