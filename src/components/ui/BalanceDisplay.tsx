import Skeleton from 'react-loading-skeleton';
import { useT } from '../../i18n';

interface BalanceDisplayProps {
    balance: { amount: string; asset: string };
    isLoading: boolean;
    isFirstLoad: boolean;
}

export function BalanceDisplay({ balance, isFirstLoad }: BalanceDisplayProps) {
    const t = useT();

    return (
        <div className="text-center">
            <p className="text-sm font-medium text-[var(--color-shades-60)] mb-2">{t('payment.balance')}</p>
            <span className="text-4xl font-bold uppercase text-white tracking-tight">
                {isFirstLoad ? (
                    <Skeleton
                        height={45}
                        width={150}
                        baseColor="var(--color-shades-20)"
                        highlightColor="var(--color-shades-30)"
                    />
                ) : (
                    `${balance.amount} ${balance.asset.toUpperCase()}`
                )}
            </span>
        </div>
    );
}
