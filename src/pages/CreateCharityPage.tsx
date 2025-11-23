import { useState, useCallback } from 'preact/hooks';
import { route } from 'preact-router';
import CharitiesStore, { type Charity } from '../store/CharitiesStore';
import { Background } from '../components/ui/Background';
import { Button, CancelButton } from '../components/ui/Button';
import { BackButton } from '../components/login/BackButton';

interface CreateCharityPageProps {
    path?: string;
}

const CATEGORIES: Array<{ value: Charity['category']; label: string }> = [
    { value: 'humanitarian', label: 'Humanitarian' },
    { value: 'children', label: 'Children' },
    { value: 'environment', label: 'Environment' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
];

export const CreateCharityPage = (_props?: CreateCharityPageProps) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        goalAmount: '',
        category: 'humanitarian' as Charity['category'],
        walletAddress: '',
        website: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = useCallback((field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        if (!formData.goalAmount.trim()) {
            newErrors.goalAmount = 'Fundraising goal is required';
        } else {
            const amount = parseFloat(formData.goalAmount.trim());
            if (isNaN(amount) || amount <= 0) {
                newErrors.goalAmount = 'Please enter a valid amount greater than 0';
            }
        }

        if (!formData.walletAddress.trim()) {
            newErrors.walletAddress = 'Wallet address is required';
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress.trim())) {
            newErrors.walletAddress = 'Invalid Ethereum wallet address';
        }

        if (formData.website.trim()) {
            try {
                new URL(formData.website.trim());
            } catch {
                newErrors.website = 'Invalid website URL';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Add charity to store
            const newCharity = CharitiesStore.addCharity({
                name: formData.name.trim(),
                description: formData.description.trim(),
                goalAmount: formData.goalAmount.trim(),
                category: formData.category,
                walletAddress: formData.walletAddress.trim(),
                website: formData.website.trim() || undefined,
                verified: false, // New charities are not verified by default
            });

            // Navigate to the new charity detail page
            route(`/charity/${newCharity.id}`);
        } catch (error) {
            console.error('Failed to create charity:', error);
            setErrors({ submit: 'Failed to create charity. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm]);

    const handleBack = useCallback(() => {
        route('/');
    }, []);

    return (
        <>
            <Background />
            <div className="fixed inset-0 flex flex-col z-50">
                {/* Header */}
                <div className="flex-shrink-0 p-4 pb-0">
                    <BackButton onBack={handleBack} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <div className="max-w-2xl mx-auto">
                        {/* Title */}
                        <div className="mb-6 mt-20">
                            <h1 className="text-3xl font-bold text-[var(--color-shades-100)] mb-2">
                                Create New Fund
                            </h1>
                            <p className="text-[var(--color-shades-80)] text-base">
                                Add a new charity or cause to support
                            </p>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-[var(--color-shades-100)] font-semibold text-sm mb-2">
                                    Fund Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onInput={(e) => handleInputChange('name', (e.target as HTMLInputElement).value)}
                                    placeholder="e.g., Save the Children"
                                    className="w-full px-4 py-3 bg-[var(--color-shades-10)] border border-[var(--color-shades-30)] rounded-lg text-[var(--color-shades-100)] placeholder-[var(--color-shades-60)] focus:border-[var(--color-cta)] focus:outline-none transition-colors touch-manipulation"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[var(--color-shades-100)] font-semibold text-sm mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onInput={(e) => handleInputChange('description', (e.target as HTMLTextAreaElement).value)}
                                    placeholder="Describe the charity's mission and work..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-[var(--color-shades-10)] border border-[var(--color-shades-30)] rounded-lg text-[var(--color-shades-100)] placeholder-[var(--color-shades-60)] focus:border-[var(--color-cta)] focus:outline-none transition-colors resize-none touch-manipulation"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            {/* Fundraising Goal */}
                            <div>
                                <label className="block text-[var(--color-shades-100)] font-semibold text-sm mb-2">
                                    Fundraising Goal (USDC) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <span className="text-[var(--color-shades-60)] text-base">$</span>
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.goalAmount}
                                        onInput={(e) => {
                                            const value = (e.target as HTMLInputElement).value;
                                            // Allow only numbers and one decimal point
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                handleInputChange('goalAmount', value);
                                            }
                                        }}
                                        placeholder="10000.00"
                                        className="w-full pl-9 pr-4 py-3 bg-[var(--color-shades-10)] border border-[var(--color-shades-30)] rounded-lg text-[var(--color-shades-100)] placeholder-[var(--color-shades-60)] focus:border-[var(--color-cta)] focus:outline-none transition-colors touch-manipulation"
                                    />
                                </div>
                                {errors.goalAmount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.goalAmount}</p>
                                )}
                                <p className="text-[var(--color-shades-70)] text-xs mt-1">
                                    Enter the total amount you're aiming to collect
                                </p>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-[var(--color-shades-100)] font-semibold text-sm mb-2">
                                    Category *
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.category}
                                        onInput={(e) => handleInputChange('category', (e.target as HTMLSelectElement).value)}
                                        className="w-full px-4 py-3 pr-12 bg-[var(--color-shades-10)] border border-[var(--color-shades-30)] rounded-lg text-[var(--color-shades-100)] focus:border-[var(--color-cta)] focus:outline-none transition-colors touch-manipulation appearance-none cursor-pointer"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-[var(--color-shades-80)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Address */}
                            <div>
                                <label className="block text-[var(--color-shades-100)] font-semibold text-sm mb-2">
                                    Wallet Address *
                                </label>
                                <input
                                    type="text"
                                    value={formData.walletAddress}
                                    onInput={(e) => handleInputChange('walletAddress', (e.target as HTMLInputElement).value)}
                                    placeholder="0x..."
                                    className="w-full px-4 py-3 bg-[var(--color-shades-10)] border border-[var(--color-shades-30)] rounded-lg text-[var(--color-shades-100)] placeholder-[var(--color-shades-60)] focus:border-[var(--color-cta)] focus:outline-none transition-colors font-mono text-sm touch-manipulation"
                                />
                                {errors.walletAddress && (
                                    <p className="text-red-500 text-sm mt-1">{errors.walletAddress}</p>
                                )}
                            </div>

                            {/* Website (Optional) */}
                            <div>
                                <label className="block text-[var(--color-shades-100)] font-semibold text-sm mb-2">
                                    Website (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onInput={(e) => handleInputChange('website', (e.target as HTMLInputElement).value)}
                                    placeholder="https://example.org"
                                    className="w-full px-4 py-3 bg-[var(--color-shades-10)] border border-[var(--color-shades-30)] rounded-lg text-[var(--color-shades-100)] placeholder-[var(--color-shades-60)] focus:border-[var(--color-cta)] focus:outline-none transition-colors touch-manipulation"
                                />
                                {errors.website && (
                                    <p className="text-red-500 text-sm mt-1">{errors.website}</p>
                                )}
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                                    <p className="text-red-500 text-sm">{errors.submit}</p>
                                </div>
                            )}

                            {/* Info Note */}
                            <div className="bg-[var(--color-cta-5)] border border-[var(--color-cta-3)] rounded-lg p-3">
                                <p className="text-[var(--color-shades-80)] text-sm">
                                    <strong className="text-[var(--color-cta)]">Note:</strong> New funds require verification before being marked as official. Donations will be sent directly to the provided wallet address.
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 space-y-3 pb-6">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                variant="primary"
                                size="lg"
                                fullWidth
                            >
                                {isSubmitting ? 'Creating...' : 'Create Fund'}
                            </Button>
                            <CancelButton
                                onClick={handleBack}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
