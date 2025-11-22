import { useMemo, useCallback, useState, useRef } from 'preact/hooks';
import { useSnapshot } from 'valtio';
import { useT } from '../../i18n';
import { config } from '../../utils/env';
import LedgerHistoryStore from '../../store/LedgerHistoryStore';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import { TransactionBottomSheet } from './TransactionBottomSheet';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useGetLedgerTransactions } from '../../hooks/useGetLedgerTransactions';

interface TransactionHistoryProps {
    walletAddress: string | null;
    onPayBack?: (participant: string) => void;
}

export function TransactionHistory({ walletAddress, onPayBack }: TransactionHistoryProps) {
    const t = useT();
    const ledgerTransactionsState = useSnapshot(LedgerHistoryStore.state);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const listScrollRef = useRef<HTMLDivElement>(null);

    const { getLedgerTransactions } = useGetLedgerTransactions();
    const getLedgerTransactionsWithOffset = useCallback(() => {
        if (
            ledgerTransactionsState.loading ||
            ledgerTransactionsState.areTransactionsFetched ||
            ledgerTransactionsState.transactions.length === 0
        ) {
            return;
        }

        getLedgerTransactions(ledgerTransactionsState.transactions.length);
    }, [ledgerTransactionsState, getLedgerTransactions]);

    useInfiniteScroll({ scrollRef: listScrollRef, onLoadMore: getLedgerTransactionsWithOffset });

    // Memoized sorted transaction entries (most recent first)
    const sortedTransactionEntries = useMemo(() => {
        return [...ledgerTransactionsState.transactions].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [ledgerTransactionsState.transactions]);

    // Format transaction entry for display
    const formatTransactionEntry = useCallback(
        (transaction: any) => {
            const isCredit = transaction.toAccount === walletAddress;
            const amount = Math.floor(parseInt(transaction.amount, 10) || 0).toString();
            const date = new Date(transaction.createdAt).toLocaleDateString();
            const time = new Date(transaction.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            const participant = isCredit ? transaction.fromAccountTag : transaction.toAccountTag;
            let isPositive = transaction.toAccount === walletAddress;

            return {
                id: transaction.id,
                type: isCredit ? 'credit' : 'debit',
                amount,
                asset: transaction.asset || config.asset,
                participant,
                date,
                time,
                isCredit,
                isPositive,
                status: transaction.status,
                txType: transaction.txType,
            };
        },
        [walletAddress],
    );

    const handleTransactionClick = useCallback(
        (transaction: any) => {
            const formatted = formatTransactionEntry(transaction);
            setSelectedTransaction(formatted);
            setIsBottomSheetOpen(true);
        },
        [formatTransactionEntry],
    );

    const handlePayBack = useCallback(
        (participant: string) => {
            if (onPayBack) {
                onPayBack(participant);
            }
            setIsBottomSheetOpen(false);
        },
        [onPayBack],
    );

    if (ledgerTransactionsState.loading && ledgerTransactionsState.transactions.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[var(--color-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--color-shades-70)]">{t('history.loading')}</p>
                </div>
            </div>
        );
    }

    if (ledgerTransactionsState.error) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-[var(--color-cta-4)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-6 h-6 text-[var(--color-cta)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-[var(--color-shades-90)] mb-1">{t('history.error')}</h3>
                    <p className="text-sm text-[var(--color-shades-70)]">{ledgerTransactionsState.error}</p>
                </div>
            </div>
        );
    }

    if (ledgerTransactionsState.transactions.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-[var(--color-shades-20)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-6 h-6 text-[var(--color-shades-60)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                        </svg>
                    </div>
                    <h3 className="font-medium text-[var(--color-shades-90)] mb-1">{t('history.empty')}</h3>
                    <p className="text-sm text-[var(--color-shades-70)]">{t('history.emptyDescription')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto " ref={listScrollRef}>
            <div className="space-y-3">
                {sortedTransactionEntries.map((transaction) => {
                    const formatted = formatTransactionEntry(transaction);
                    return (
                        <div
                            key={transaction.id}
                            className="bg-[var(--color-shades-5)]/60 rounded-md p-4 hover:bg-[var(--color-shades-10)] transition-colors cursor-pointer"
                            onClick={() => handleTransactionClick(transaction)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex justify-start items-center">
                                        <div
                                            className={`w-10 h-10 rounded-3xl flex items-center justify-center mr-3 ${
                                                formatted.isCredit ? 'bg-[#B6F24E]/15' : 'bg-[#FB8C7F]/15'
                                            }`}>
                                            {formatted.isCredit ? (
                                                <ArrowDownIcon className="w-5 h-5 text-[var(--color-base-green)]" />
                                            ) : (
                                                <ArrowUpIcon className="w-5 h-5 text-[var(--color-cta)]" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`font-semibold ${formatted.isPositive ? 'text-[var(--color-base-green)]' : 'text-[var(--color-cta)]'}`}>
                                                    {formatted.isPositive ? '+' : '-'}
                                                    {formatted.amount}
                                                </span>
                                                <span className="text-[var(--color-shades-70)] text-xs font-medium uppercase">
                                                    {formatted.asset}
                                                </span>
                                                {formatted.status && (
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${
                                                            formatted.status === 'completed'
                                                                ? 'bg-[var(--color-base-green)]/20 text-[var(--color-base-green)]'
                                                                : formatted.status === 'pending'
                                                                  ? 'bg-[var(--color-base-yellow)]/20 text-[var(--color-base-yellow)]'
                                                                  : 'bg-[var(--color-cta)]/20 text-[var(--color-cta)]'
                                                        }`}>
                                                        {formatted.status}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[var(--color-shades-60)] text-xs mt-1">
                                                {formatted.isCredit ? t('history.receivedFrom') : t('history.sentTo')}{' '}
                                                {formatted.participant}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[var(--color-shades-80)] text-sm">{formatted.date}</p>
                                    <p className="text-[var(--color-shades-60)] text-xs">{formatted.time}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {ledgerTransactionsState.loading && (
                    <div className="absolute bottom-0 w-full flex items-center justify-center bg-black rounded-lg border-t border-[var(--color-shades-20)] ">
                        <span class="text-xs text-[var(--color-shades-60)] py-1">Loading...</span>
                    </div>
                )}
            </div>

            <TransactionBottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
                transaction={selectedTransaction}
                onPayBack={handlePayBack}
            />
        </div>
    );
}
