import { useState } from 'preact/hooks';

interface Fundraiser {
    id: string;
    title: string;
    amount: string;
    imageUrl?: string;
}

interface ActiveFundraisersProps {
    fundraisers: Fundraiser[];
    onViewAll?: () => void;
}

const FundraiserCard = ({ fundraiser }: { fundraiser: Fundraiser }) => {
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const formatNumber = (num: string) => {
        return new Intl.NumberFormat('uk-UA').format(parseFloat(num));
    };

    return (
        <div className="flex-shrink-0 w-44 bg-[var(--color-shades-10)] rounded-2xl overflow-hidden border border-[var(--color-shades-30)]">
            <div className="h-32 bg-white flex items-center justify-center relative overflow-hidden p-6">
                {fundraiser.imageUrl && !logoError ? (
                    <img
                        src={fundraiser.imageUrl}
                        alt="Charity logo"
                        className={`max-w-full max-h-full object-contain ${logoLoaded ? 'loaded' : ''}`}
                        onLoad={() => setLogoLoaded(true)}
                        onError={() => setLogoError(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center text-[var(--color-shades-60)]">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                        </svg>
                    </div>
                )}
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-[var(--color-shades-0)]">
                    <div
                        className="h-full bg-[var(--color-cta)]"
                        style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                </div>
            </div>
            <div className="p-3">
                <h4 className="text-[var(--color-shades-100)] font-semibold text-sm mb-1 line-clamp-2">
                    {fundraiser.title}
                </h4>
                <p className="text-[var(--color-shades-70)] text-xs">
                    Collected {formatNumber(fundraiser.amount)} ₴
                </p>
            </div>
        </div>
    );
};

export const ActiveFundraisers = ({ fundraisers, onViewAll }: ActiveFundraisersProps) => {
    if (fundraisers.length === 0) {
        return null;
    }

    return (
        <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[var(--color-shades-100)] font-bold text-lg">Active Fundraisers</h3>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-[var(--color-cta)] text-sm font-semibold hover:text-opacity-80">
                        View All
                    </button>
                )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {fundraisers.map((fundraiser) => (
                    <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
                ))}
            </div>
        </div>
    );
};
