import { useRef, useEffect } from 'preact/hooks';
import { ArrowUpIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useT } from '../../i18n';
import { useSnapshot } from 'valtio';
import UserTagStore from '../../store/UserTagStore';

interface TransactionBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: {
        id: string;
        type: 'credit' | 'debit';
        amount: string;
        asset: string;
        participant: string;
        date: string;
        time: string;
        isCredit: boolean;
    } | null;
    onPayBack: (participant: string) => void;
}

export function TransactionBottomSheet({ isOpen, onClose, transaction, onPayBack }: TransactionBottomSheetProps) {
    const t = useT();
    const sheetRef = useRef<HTMLDivElement>(null);
    const userTagStoreState = useSnapshot(UserTagStore.state);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !transaction) return null;

    const handlePayBack = () => {
        onPayBack(transaction.participant);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Bottom Sheet */}
            <div
                ref={sheetRef}
                className="relative w-full max-w-md bg-[var(--color-shades-5)] rounded-t-2xl border-t border-[var(--color-shades-10)] animate-slide-up">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-8 h-1 bg-[var(--color-shades-30)] rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-shades-10)]">
                    <h3 className="text-lg font-semibold text-[var(--color-shades-90)]">
                        {t('history.transactionDetails')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-[var(--color-shades-10)] transition-colors">
                        <XMarkIcon className="w-6 h-6 text-[var(--color-shades-60)]" />
                    </button>
                </div>

                {/* Transaction Details */}
                <div className="p-6 space-y-4">
                    {/* Amount and Icon */}
                    <div className="flex items-center space-x-4">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                transaction.isCredit ? 'bg-[#B6F24E]/15' : 'bg-[#FB8C7F]/15'
                            }`}>
                            {transaction.isCredit ? (
                                <ArrowDownIcon className="w-6 h-6 text-[var(--color-base-green)]" />
                            ) : (
                                <ArrowUpIcon className="w-6 h-6 text-[var(--color-cta)]" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`text-2xl font-bold ${
                                        transaction.isCredit
                                            ? 'text-[var(--color-base-green)]'
                                            : 'text-[var(--color-cta)]'
                                    }`}>
                                    {transaction.isCredit ? '+' : '-'}
                                    {transaction.amount}
                                </span>
                                <span className="text-[var(--color-shades-70)] text-sm font-medium uppercase">
                                    {transaction.asset}
                                </span>
                            </div>
                            <p className="text-[var(--color-shades-70)] text-sm mt-1">
                                {transaction.isCredit ? t('history.receivedFrom') : t('history.sentTo')}{' '}
                                <span className="font-medium text-[var(--color-shades-90)]">
                                    {transaction.participant}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="space-y-2 pt-4 border-t border-[var(--color-shades-10)]">
                        <div className="flex justify-between">
                            <span className="text-[var(--color-shades-70)] text-sm">{t('history.date')}</span>
                            <span className="text-[var(--color-shades-90)] text-sm">{transaction.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--color-shades-70)] text-sm">{t('history.time')}</span>
                            <span className="text-[var(--color-shades-90)] text-sm">{transaction.time}</span>
                        </div>
                        {userTagStoreState?.userTag && (
                            <div className="flex justify-between">
                                <span className="text-[var(--color-shades-70)] text-sm">
                                    {transaction.isCredit ? t('history.sentTo') : t('history.receivedFrom')}
                                </span>
                                <span className="text-[var(--color-shades-90)] text-sm">
                                    {userTagStoreState.userTag}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4">
                        {/* Pay Button - For all transactions with participant */}
                        {transaction.participant && (
                            <button
                                onClick={handlePayBack}
                                className="w-full py-3 px-4 bg-[var(--color-cta)] text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2">
                                <span>{t('history.pay')}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Safe Area */}
                <div className="pb-safe" />
            </div>
        </div>
    );
}
