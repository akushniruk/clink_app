interface DonationSectionProps {
    totalAmount: string;
    goalAmount?: string;
    previousAmount?: string;
    participantsCount?: number;
    currency?: string;
    onDonate: () => void;
}

export const DonationSection = ({
    totalAmount,
    goalAmount,
    previousAmount,
    participantsCount: _participantsCount,
    currency = '$',
    onDonate,
}: DonationSectionProps) => {
    const formatNumber = (num: string) => {
        return new Intl.NumberFormat('uk-UA').format(parseFloat(num));
    };

    const total = parseFloat(totalAmount);
    const goal = goalAmount ? parseFloat(goalAmount) : null;
    const remaining = goal ? Math.max(0, goal - total) : null;
    const progressPercentage = goal ? Math.min(100, (total / goal) * 100) : 0;

    return (
        <div className="bg-[var(--color-shades-0)] rounded-3xl p-6 mx-4 shadow-lg">
            <div className="text-center mb-4">
                <h2 className="text-4xl font-bold text-text mb-2">
                    {currency} {formatNumber(totalAmount)}
                </h2>

                {goal && (
                    <>
                        <p className="text-[var(--color-shades-80)] text-sm mb-3">
                            raised of {currency} {formatNumber(goalAmount!)} goal
                        </p>

                        {/* Progress bar */}
                        <div className="w-full bg-[var(--color-shades-20)] rounded-full h-2 mb-2 overflow-hidden">
                            <div
                                className="bg-[var(--color-cta)] h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        {remaining !== null && remaining > 0 && (
                            <p className="text-[var(--color-shades-70)] text-xs">
                                {currency} {formatNumber(remaining.toString())} remaining to reach goal
                            </p>
                        )}

                        {progressPercentage >= 100 && (
                            <p className="text-[var(--color-base-green)] text-sm font-semibold mt-1">
                                🎉 Goal reached!
                            </p>
                        )}
                    </>
                )}

                {!goal && previousAmount && (
                    <p className="text-text text-sm flex items-center justify-center gap-1">
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
