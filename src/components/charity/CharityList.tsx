import type { Charity } from '../../store/CharitiesStore';
import { CharityCard } from './CharityCard';

interface CharityListProps {
    charities: readonly Charity[];
}

const EmptyState = () => (
    <div className="text-center py-12">
        <p className="text-[var(--color-shades-60)] text-lg">No charities found</p>
        <p className="text-[var(--color-shades-70)] text-sm mt-2">Try a different search term</p>
    </div>
);

export const CharityList = ({ charities }: CharityListProps) => {
    if (charities.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid gap-3 mb-4">
            {charities.map((charity) => (
                <CharityCard key={charity.id} charity={charity} />
            ))}
        </div>
    );
};
