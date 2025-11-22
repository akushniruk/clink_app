import { useState, useCallback, useEffect } from 'preact/hooks';

export type Currency = 'USDC' | 'USDT' | 'XRP' | 'WETH';

interface DonationModalProps {
    isOpen: boolean;
    charityName: string;
    onClose: () => void;
    onConfirm: (amount: string, currency: Currency) => void;
    isProcessing?: boolean;
}

const CURRENCIES: { value: Currency; label: string; icon: string }[] = [
    { value: 'USDC', label: 'USDC', icon: '$' },
    { value: 'USDT', label: 'USDT', icon: '$' },
    { value: 'XRP', label: 'XRP', icon: 'X' },
    { value: 'WETH', label: 'wETH', icon: 'Ξ' },
];

export const DonationModal = ({ isOpen, charityName, onClose, onConfirm, isProcessing = false }: DonationModalProps) => {
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USDC');
    const [error, setError] = useState('');

    // Quick amount buttons
    const quickAmounts = ['5', '10', '20', '50', '100'];

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setSelectedCurrency('USDC');
            setError('');
        }
    }, [isOpen]);

    const handleAmountChange = useCallback((value: string) => {
        // Only allow numbers and decimals
        const sanitized = value.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        const parts = sanitized.split('.');
        if (parts.length > 2) return;

        setAmount(sanitized);
        setError('');
    }, []);

    const handleQuickAmount = useCallback((quickAmount: string) => {
        setAmount(quickAmount);
        setError('');
    }, []);

    const handleConfirm = useCallback(() => {
        const numAmount = parseFloat(amount);

        if (!amount || isNaN(numAmount)) {
            setError('Please enter a valid amount');
            return;
        }

        if (numAmount <= 0) {
            setError('Amount must be greater than 0');
            return;
        }

        onConfirm(amount, selectedCurrency);
    }, [amount, selectedCurrency, onConfirm]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
                onClick={!isProcessing ? onClose : undefined}
            />

            {/* Modal */}
            <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
                <div className="bg-[var(--color-shades-5)] rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--color-shades-100)] mb-1">
                                Make a Donation
                            </h2>
                            <p className="text-[var(--color-shades-70)] text-sm">
                                to {charityName}
                            </p>
                        </div>
                        {!isProcessing && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[var(--color-shades-20)] rounded-full transition-colors">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--color-shades-100)"
                                    strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Currency Selection */}
                    <div className="mb-4">
                        <label className="text-[var(--color-shades-80)] text-sm font-semibold mb-2 block">
                            Select Currency
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {CURRENCIES.map((currency) => (
                                <button
                                    key={currency.value}
                                    onClick={() => setSelectedCurrency(currency.value)}
                                    disabled={isProcessing}
                                    className={`p-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex flex-col items-center gap-1 ${
                                        selectedCurrency === currency.value
                                            ? 'bg-[var(--color-cta)] text-[var(--color-shades-100)] border-2 border-[var(--color-cta)]'
                                            : 'bg-[var(--color-shades-10)] text-[var(--color-shades-80)] border-2 border-[var(--color-shades-30)] hover:border-[var(--color-shades-50)]'
                                    }`}>
                                    <span className="text-xl">{currency.icon}</span>
                                    <span className="text-xs">{currency.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-4">
                        <label className="text-[var(--color-shades-80)] text-sm font-semibold mb-2 block">
                            Enter Amount
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amount}
                                onInput={(e) => handleAmountChange((e.target as HTMLInputElement).value)}
                                disabled={isProcessing}
                                className="w-full px-4 py-4 bg-[var(--color-shades-10)] border border-[var(--color-shades-30)] rounded-xl text-[var(--color-shades-100)] text-2xl font-bold placeholder-[var(--color-shades-60)] focus:outline-none focus:border-[var(--color-cta)] transition-colors disabled:opacity-50"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-shades-60)] text-lg font-semibold">
                                {selectedCurrency}
                            </span>
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="mb-6">
                        <p className="text-[var(--color-shades-80)] text-sm font-semibold mb-3">
                            Quick Select
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {quickAmounts.map((quickAmount) => (
                                <button
                                    key={quickAmount}
                                    onClick={() => handleQuickAmount(quickAmount)}
                                    disabled={isProcessing}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                                        amount === quickAmount
                                            ? 'bg-[var(--color-cta)] text-[var(--color-shades-100)]'
                                            : 'bg-[var(--color-shades-10)] text-[var(--color-shades-80)] hover:bg-[var(--color-shades-20)]'
                                    }`}>
                                    ${quickAmount}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-[var(--color-shades-10)] rounded-xl p-4 mb-6 border border-[var(--color-shades-30)]">
                        <div className="flex items-start gap-3">
                            <div className="text-blue-400 mt-0.5">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-[var(--color-shades-80)] text-sm leading-relaxed">
                                    Your donation will be processed on the blockchain. Transaction fees may apply.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 py-4 bg-[var(--color-shades-20)] text-[var(--color-shades-100)] rounded-xl font-bold text-lg hover:bg-[var(--color-shades-30)] transition-all disabled:opacity-50">
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing || !amount}
                            className="flex-1 py-4 bg-[var(--color-cta)] text-[var(--color-shades-100)] rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Donation'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
