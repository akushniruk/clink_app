import { proxy } from 'valtio';
import charitiesData from '../data/charities.json';

export interface Charity {
    id: string;
    name: string;
    description: string;
    category: 'humanitarian' | 'children' | 'environment' | 'healthcare' | 'education' | 'other';
    walletAddress: string;
    imageUrl?: string;
    website?: string;
    verified: boolean;
    createdAt?: string;
    goalAmount?: string;
}

export interface ICharitiesState {
    charities: Charity[];
    loading: boolean;
    error: string | null;
    selectedCharity: Charity | null;
}

const state = proxy<ICharitiesState>({
    charities: charitiesData as Charity[],
    loading: false,
    error: null,
    selectedCharity: null,
});

const CharitiesStore = {
    state,

    /**
     * Get all charities
     */
    getCharities(): Charity[] {
        return state.charities;
    },

    /**
     * Get charity by ID
     */
    getCharityById(id: string): Charity | undefined {
        return state.charities.find((charity) => charity.id === id);
    },

    /**
     * Get charities by category
     */
    getCharitiesByCategory(category: Charity['category']): Charity[] {
        return state.charities.filter((charity) => charity.category === category);
    },

    /**
     * Get verified charities only
     */
    getVerifiedCharities(): Charity[] {
        return state.charities.filter((charity) => charity.verified);
    },

    /**
     * Search charities by name or description
     */
    searchCharities(query: string): Charity[] {
        const lowerQuery = query.toLowerCase();
        return state.charities.filter(
            (charity) =>
                charity.name.toLowerCase().includes(lowerQuery) ||
                charity.description.toLowerCase().includes(lowerQuery),
        );
    },

    /**
     * Add a new charity
     */
    addCharity(charity: Omit<Charity, 'id' | 'createdAt'>): Charity {
        const newCharity: Charity = {
            ...charity,
            id: Date.now().toString(), // Simple ID generation
            createdAt: new Date().toISOString(),
        };

        state.charities = [...state.charities, newCharity];
        return newCharity;
    },

    /**
     * Update an existing charity
     */
    updateCharity(id: string, updates: Partial<Charity>): boolean {
        const index = state.charities.findIndex((charity) => charity.id === id);
        if (index === -1) return false;

        state.charities[index] = {
            ...state.charities[index],
            ...updates,
        };
        return true;
    },

    /**
     * Remove a charity
     */
    removeCharity(id: string): boolean {
        const index = state.charities.findIndex((charity) => charity.id === id);
        if (index === -1) return false;

        state.charities = state.charities.filter((charity) => charity.id !== id);
        return true;
    },

    /**
     * Set selected charity
     */
    setSelectedCharity(charity: Charity | null): void {
        state.selectedCharity = charity;
    },

    /**
     * Set loading state
     */
    setLoading(loading: boolean): void {
        state.loading = loading;
    },

    /**
     * Set error state
     */
    setError(error: string | null): void {
        state.error = error;
    },

    /**
     * Reset store to initial state
     */
    reset(): void {
        state.charities = charitiesData as Charity[];
        state.loading = false;
        state.error = null;
        state.selectedCharity = null;
    },
};

export default CharitiesStore;
