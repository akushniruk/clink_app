import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import type { Charity } from '../../store/CharitiesStore';

// Static category colors
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
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    } catch {
        return null;
    }
};

interface FeaturedCharityCardProps {
    charity: Charity;
}

const FeaturedCharityCard = ({ charity }: FeaturedCharityCardProps) => {
    const categoryColor = getCategoryColor(charity.category);
    const [logoError, setLogoError] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

    return (
        <button
            onClick={() => route(`/charity/${charity.id}`)}
            className="flex flex-col items-center gap-2 group">
            {/* Card with logo */}
            <div
                className="w-full aspect-square rounded-2xl flex items-center justify-center text-4xl font-bold overflow-hidden transition-transform group-hover:scale-105"
                style={{
                    backgroundColor: logoError ? categoryColor + '30' : 'var(--color-shades-0)',
                    color: categoryColor,
                }}>
                {!logoError && getCharityLogoUrl(charity.website) ? (
                    <img
                        src={getCharityLogoUrl(charity.website)!}
                        alt={charity.name}
                        className={`w-full h-full object-contain p-4 bg-white ${logoLoaded ? 'loaded' : ''}`}
                        onError={() => setLogoError(true)}
                        onLoad={() => setLogoLoaded(true)}
                    />
                ) : (
                    <span style={{ color: categoryColor }}>{charity.name.charAt(0).toUpperCase()}</span>
                )}
            </div>

            {/* Charity name */}
            <span className="text-[var(--color-shades-100)] text-sm font-semibold text-left line-clamp-2 w-full">
                {charity.name}
            </span>
        </button>
    );
};

interface FeaturedCharitiesProps {
    charities: readonly Charity[];
}

export const FeaturedCharities = ({ charities }: FeaturedCharitiesProps) => {
    if (charities.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--color-shades-60)] text-lg">No charities found</p>
                <p className="text-[var(--color-shades-70)] text-sm mt-2">Try a different search term</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-3">
            {charities.map((charity) => (
                <FeaturedCharityCard key={charity.id} charity={charity} />
            ))}
        </div>
    );
};
