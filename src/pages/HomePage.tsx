import { useSnapshot } from 'valtio';
import { useState, useMemo, useCallback, useEffect, useRef } from 'preact/hooks';
import CharitiesStore from '../store/CharitiesStore';
import { Background } from '../components/ui/Background';
import { Header } from '../components/layout/Header';
import { SearchInput, FeaturedCharities } from '../components/charity';

interface HomePageProps {
    path?: string;
}

export const HomePage = (_props?: HomePageProps) => {
    const charitiesState = useSnapshot(CharitiesStore.state);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const debounceTimerRef = useRef<number>();

    // Debounce search input (300ms delay)
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = window.setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery]);

    // Handle search input change
    const handleSearchInput = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    // Handle new charity click
    const handleNewClick = useCallback(() => {
        // TODO: Implement add new charity functionality
        console.log('Add new charity clicked');
        alert('Add new charity feature coming soon!');
    }, []);

    // Filter charities based on debounced search query
    const filteredCharities = useMemo(() => {
        if (!debouncedQuery.trim()) {
            return charitiesState.charities;
        }
        return CharitiesStore.searchCharities(debouncedQuery);
    }, [debouncedQuery, charitiesState.charities]);

    return (
        <>
            <Background />
            <div className="fixed inset-0 flex flex-col z-50">

                {/* Content */}
                <div className="flex-1 overflow-y-auto pb-4">
                    <div className="max-w-2xl mx-auto">
                        {/* Title Section */}
                        <div className="px-4 bg-gradient-to-t from-[var(--color-cta)] to-[#863100] pb-4">
                            <div className="pt-4">
                                <Header showHomeButton={false} onNewClick={handleNewClick} />
                            </div>
                            <div className="mb-4 mt-16">
                                <h1 className="text-3xl font-bold text-[var(--color-shades-100)] mb-2">
                                    Support a Cause
                                </h1>
                                <p className="text-[var(--color-shades-80)] text-base">
                                    Choose a charity to make a difference
                                </p>
                            </div>

                            {/* Search Input */}
                            <div className="mb-6">
                                <SearchInput
                                    value={searchQuery}
                                    onInput={handleSearchInput}
                                    placeholder="Search charities..."
                                />
                            </div>
                        </div>

                        <div className="px-4">
                            {/* All Charities in Grid */}
                            <h3 className="text-xl font-bold text-[var(--color-shades-100)] my-4">Funds</h3>
                            <FeaturedCharities charities={filteredCharities} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
