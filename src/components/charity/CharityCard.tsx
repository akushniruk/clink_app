import { memo } from 'preact/compat';
import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import type { Charity } from '../../store/CharitiesStore';

// Static category colors - no need to recreate on every render
const CATEGORY_COLORS: Record<Charity['category'], string> = {
    humanitarian: 'var(--color-cta)',
    children: 'var(--color-base-violet)',
    environment: 'var(--color-base-green)',
    healthcare: 'var(--color-base-red)',
    education: 'var(--color-base-yellow)',
    other: 'var(--color-shades-60)',
};

const getCategoryColor = (category: Charity['category']) => CATEGORY_COLORS[category];

// Extract domain from website URL for logo
const getCharityLogoUrl = (website?: string) => {
    if (!website) return null;
    try {
        const domain = new URL(website).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
        return null;
    }
};

interface CharityCardProps {
    charity: Charity;
}

export const CharityCard = memo(({ charity }: CharityCardProps) => {
    const categoryColor = getCategoryColor(charity.category);
    const [logoError, setLogoError] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

    return (
        <div className="bg-[var(--color-shades-10)] rounded-2xl p-4 border border-[var(--color-shades-30)] hover:border-[var(--color-shades-50)] transition-all hover:shadow-lg">
            <div className="flex items-start gap-3">
                {/* Charity logo or category indicator */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden"
                    style={{
                        backgroundColor: categoryColor + '30',
                        color: categoryColor,
                    }}>
                    {!logoError && getCharityLogoUrl(charity.website) ? (
                        <img
                            src={getCharityLogoUrl(charity.website)!}
                            alt={charity.name}
                            className={`w-full h-full object-cover ${logoLoaded ? 'loaded' : ''}`}
                            onError={() => setLogoError(true)}
                            onLoad={() => setLogoLoaded(true)}
                        />
                    ) : (
                        charity.name.charAt(0).toUpperCase()
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-[var(--color-shades-100)] font-semibold text-base leading-tight">
                            {charity.name}
                        </h3>
                        {charity.verified && (
                            <span
                                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: 'var(--color-base-green)', color: 'var(--color-shades-0)' }}
                                title="Verified">
                                ✓
                            </span>
                        )}
                    </div>

                    <p className="text-[var(--color-shades-70)] text-sm leading-snug mb-2 line-clamp-2">
                        {charity.description}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                        <span
                            className="text-xs font-semibold px-2 py-1 rounded-md"
                            style={{
                                backgroundColor: categoryColor + '20',
                                color: categoryColor,
                            }}>
                            {charity.category}
                        </span>

                        <button
                            onClick={() => route(`/charity/${charity.id}`)}
                            className="text-[var(--color-cta)] text-sm font-semibold hover:text-opacity-80 transition-colors">
                            View →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
