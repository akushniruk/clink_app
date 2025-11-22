interface DonationSectionProps {
    totalAmount: string;
    previousAmount?: string;
    participantsCount?: number;
    currency?: string;
    onDonate: () => void;
}

export const DonationSection = ({
    totalAmount,
    previousAmount,
    participantsCount,
    currency = 'UAH',
    onDonate,
}: DonationSectionProps) => {
    const formatNumber = (num: string) => {
        return new Intl.NumberFormat('uk-UA').format(parseFloat(num));
    };

    return (
        <div className="bg-[var(--color-shades-0)] rounded-3xl p-6 mx-4 shadow-lg">
            {participantsCount && (
                <p className="text-center text-[var(--color-shades-60)] text-sm mb-3">
                    Collected by {formatNumber(participantsCount.toString())} participants
                </p>
            )}

            <div className="text-center mb-4">
                <h2 className="text-4xl font-bold text-[var(--color-shades-5)] mb-2">
                    {formatNumber(totalAmount)} {currency}
                </h2>
                {previousAmount && (
                    <p className="text-[var(--color-shades-60)] text-sm flex items-center justify-center gap-1">
                        <span>↺</span>
                        <span>Collected {formatNumber(previousAmount)} {currency}</span>
                    </p>
                )}
            </div>

            <button
                onClick={onDonate}
                className="w-full py-4 bg-[var(--color-cta)] text-[var(--color-shades-100)] rounded-2xl font-bold text-lg hover:bg-opacity-90 transition-all">
                Donate
            </button>
        </div>
    );
};
