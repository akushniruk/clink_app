import { Background } from '../components/ui/Background';
import { Button } from '../components/ui';
import { formatAddress } from '../utils/addressUtils';
import { useT } from '../i18n';
import { config } from '../utils/env';
import { useSnapshot } from 'valtio';
import UserTagStore from '../store/UserTagStore';

interface SuccessPageProps {
    recipientAddress: string;
    amount: string;
    transactionId?: string;
    charityName?: string;
    onDone: () => void;
}

export const SuccessPage = ({ recipientAddress, amount, charityName, onDone }: SuccessPageProps) => {
    const t = useT();

    const userTagStoreState = useSnapshot(UserTagStore.state);

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden">
            <Background />

            <div className="relative z-10 h-full flex flex-col">
                {/* Header with Icon */}
                <div className="flex-shrink-0 flex items-center justify-center pt-8 pb-4">
                    <img
                        src="/app_icons/success.png"
                        alt="Success"
                        width="228"
                        height="228"
                        className="w-[228px] h-[228px] object-contain"
                    />
                </div>

                {/* Content - centered in available space */}
                <div className="flex-1 flex flex-col  items-center px-6">
                    {/* Amount Display */}
                    <div className="flex gap-1 text-white items-start mb-6">
                        <span className="text-6xl font-bold">{amount}</span>
                        <span className="text-2xl font-bold self-end mb-2 uppercase">{config.asset}</span>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-xl font-semibold text-[var(--color-base-green)] mb-2">
                        {t('payment.success')}
                    </h1>

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

                    {userTagStoreState.userTag && (
                        <div className="flex flex-row justify-between items-center w-full py-4 border-y border-[var(--color-cta-4)] text-sm">
                            <span className="font-semibold text-[var(--color-shades-50)]">{t('payment.sender')}</span>
                            <div className="font-semibold text-[var(--color-base-red)]">
                                {formatAddress(userTagStoreState.userTag)}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-row justify-between items-center w-full py-4 border-y border-[var(--color-cta-4)] text-sm">
                        <span className="font-semibold text-[var(--color-shades-50)]">{t('payment.date')}</span>
                        <div className="font-semibold text-[var(--color-base-red)]">
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Done Button */}
                <div className="flex-shrink-0">
                    <div className="px-6 pb-6">
                        <Button onClick={onDone} variant="primary" size="lg" fullWidth>
                            {t('common.close')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
