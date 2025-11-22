import { Background } from '../components/ui/Background';
import { Button } from '../components/ui';
import { formatAddress } from '../utils/addressUtils';
import { useT } from '../i18n';
import { config } from '../utils/env';
import { useMemo } from 'preact/hooks';

interface FailurePageProps {
    recipientAddress: string;
    amount: string;
    errorMessage?: string;
    charityName?: string;
    onRetry: () => void;
    onCancel: () => void;
}

export const FailurePage = ({ recipientAddress, amount, onCancel, errorMessage, charityName }: FailurePageProps) => {
    const t = useT();
    const errorMessageKey = useMemo(() => {
        if (!errorMessage) return 'payment.error.default';

        const lowerError = errorMessage.toLowerCase();

        if (lowerError.includes('failed to get wallet by tag')) {
            return 'payment.error.tag';
        }
        if (lowerError.includes('insufficient') || lowerError.includes('balance')) {
            return 'payment.error.insufficient';
        }
        if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
            return 'payment.error.timeout';
        }
        return lowerError.length > 60 ? 'payment.error.unknown' : 'payment.error.default';
    }, [errorMessage]);

    const centerGlowStyle = {
        position: 'absolute' as const,
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 260,
        height: 260,
        borderRadius: '50%',
        pointerEvents: 'none' as const,
        backdropFilter: 'blur(70px)',
        WebkitBackdropFilter: 'blur(70px)',
        maskImage: 'linear-gradient(to top, transparent 0%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 100%)',
        backgroundColor: 'var(--color-error)',
        opacity: 0.7,
        zIndex: 2,
    };

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden">
            <Background />
            <div style={centerGlowStyle} />

            <div className="relative z-10 h-full flex flex-col">
                {/* Header with Icon */}
                <div className="flex-shrink-0 flex items-center justify-center pt-8 pb-4">
                    <img
                        src="/app_icons/fail.png"
                        alt="Failed"
                        width="228"
                        height="228"
                        className="w-[228px] h-[228px] object-contain"
                    />
                </div>

                {/* Content - centered in available space */}
                <div className="flex-1 flex flex-col items-center px-6">
                    {/* Amount Display */}
                    <div className="flex gap-1 text-white items-start mb-6">
                        <span className="text-6xl font-bold">{amount}</span>
                        <span className="text-2xl font-bold self-end mb-2 uppercase">{config.asset}</span>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-xl font-semibold text-[var(--color-base-red)] mb-2">{t(errorMessageKey)}</h1>

                    {charityName && (
                        <div className="flex flex-row justify-between items-center w-full py-4 mt-12 border-y border-[var(--color-cta-4)] text-sm">
                            <span className="font-semibold text-[var(--color-shades-50)]">Organization</span>
                            <div className="font-semibold text-[var(--color-base-red)]">{charityName}</div>
                        </div>
                    )}

                    <div className={`flex flex-row justify-between items-center w-full py-4 ${!charityName ? 'mt-12' : ''} border-y border-[var(--color-cta-4)] text-sm`}>
                        <span className="font-semibold text-[var(--color-shades-50)]">{t('payment.receiver')}</span>
                        <div className="font-semibold text-[var(--color-base-red)]">
                            {formatAddress(recipientAddress)}
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Close Button */}
                <div className="flex-shrink-0">
                    <div className="px-6 pb-6">
                        <Button onClick={onCancel} variant="primary" size="lg" fullWidth>
                            {t('common.close')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
