import { useEffect, useState, useCallback, useMemo } from 'preact/hooks';
import { route } from 'preact-router';
import CharitiesStore, { type Charity } from '../store/CharitiesStore';
import { Background } from '../components/ui/Background';
import { CharityDetailHeader } from '../components/charity/CharityDetailHeader';
import { DonationSection } from '../components/charity/DonationSection';
import { ActiveFundraisers } from '../components/charity/ActiveFundraisers';
import { EnterAmountPage } from './EnterAmountPage';
import { ConfirmationPage, type Currency } from './ConfirmationPage';
import { SuccessPage } from './SuccessPage';
import { FailurePage } from './FailurePage';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { trackFeatureUsed } from '../utils/analytics';
import { useLoginState } from '../hooks/useLoginState';

interface CharityDetailPageProps {
    id?: string;
    path?: string;
}

// Fixed donation wallet address for all charities
const DONATION_WALLET_ADDRESS = '0xc49A7cbe9C36945867e309727B68A651a1913F27';

// Currency selection commented out - always using USDC with $ symbol
// const CURRENCIES: { value: Currency; label: string; icon: string }[] = [
//     { value: 'USDC', label: 'USDC', icon: '$' },
//     { value: 'USDT', label: 'USDT', icon: '$' },
//     { value: 'XRP', label: 'XRP', icon: 'X' },
//     { value: 'WETH', label: 'wETH', icon: 'Ξ' },
// ];

export const CharityDetailPage = ({ id }: CharityDetailPageProps) => {
    const [charity, setCharity] = useState<Charity | null>(null);
    const [currentView, setCurrentView] = useState<'detail' | 'amount' | 'confirmation' | 'success' | 'failure'>('detail');
    const selectedCurrency: Currency = 'USDC'; // Always USDC
    const [donationAmount, setDonationAmount] = useState<string>('');
    const { walletAddress } = useLoginState();

    // Payment flow state management
    const paymentFlow = usePaymentFlow({
        onSuccess: () => {
            setCurrentView('success');
        },
        onFailure: () => {
            setCurrentView('failure');
        },
    });

    useEffect(() => {
        if (!id) {
            // No ID provided, redirect to home
            route('/');
            return;
        }

        const foundCharity = CharitiesStore.getCharityById(id);
        if (foundCharity) {
            setCharity(foundCharity);
        } else {
            // Charity not found, redirect to home
            route('/');
        }
    }, [id]);

    if (!charity) {
        return (
            <>
                <Background />
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="w-8 h-8 border-2 border-[var(--color-cta)] border-t-transparent rounded-full animate-spin" />
                </div>
            </>
        );
    }

    const handleDonate = useCallback(() => {
        // Track donation button click
        trackFeatureUsed('charity_donate_clicked', walletAddress || undefined, {
            charity_id: charity?.id,
            charity_name: charity?.name,
        });

        // Show EnterAmountPage
        setCurrentView('amount');
    }, [charity, walletAddress]);

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: charity.name,
                    text: charity.description,
                    url: window.location.href,
                })
                .catch(() => { });
        }
    };

    const handleAmountComplete = useCallback(
        (amount: string) => {
            setDonationAmount(amount);
            paymentFlow.setPaymentAmount(amount);
            setCurrentView('confirmation');
        },
        [paymentFlow],
    );

    const handleConfirmPayment = useCallback(async () => {
        // Track payment confirmation
        trackFeatureUsed('charity_payment_confirmed', walletAddress || undefined, {
            charity_id: charity?.id,
            charity_name: charity?.name,
            amount: parseInt(donationAmount, 10),
            currency: selectedCurrency,
        });

        // Execute the payment using usePaymentFlow hook
        await paymentFlow.handleConfirmPayment(DONATION_WALLET_ADDRESS, {
            eventName: 'charity_donation_confirmed',
            stepNumber: 3,
            paymentMethod: 'charity_donation',
            additionalData: {
                charity_id: charity?.id,
                charity_name: charity?.name,
                currency: selectedCurrency,
            },
        });
    }, [donationAmount, selectedCurrency, charity, walletAddress, paymentFlow]);

    const handleBackFromAmount = useCallback(() => {
        setCurrentView('detail');
    }, []);

    const handleBackFromConfirmation = useCallback(() => {
        setCurrentView('amount');
    }, []);

    const handleDone = useCallback(() => {
        setCurrentView('detail');
        setDonationAmount('');
        paymentFlow.resetPaymentState();
    }, [paymentFlow]);

    // Extract domain from website URL for logo
    const getCharityLogoUrl = (website?: string) => {
        if (!website) return null;
        try {
            const domain = new URL(website).hostname;
            // Use sz=256 for higher quality, Google supports up to 256
            const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
            console.log('Loading logo for', charity?.name, ':', logoUrl);
            return logoUrl;
        } catch (error) {
            console.error('Error parsing website URL:', website, error);
            return null;
        }
    };

    // Get random fundraisers from OTHER charities
    const activeFundraisers = useMemo(() => {
        const charitiesState = CharitiesStore.getCharities();

        // Get other charities (exclude current charity)
        const otherCharities = charitiesState.filter((c) => c.id !== charity?.id);

        // Shuffle and take 3 random charities
        const shuffled = [...otherCharities].sort(() => Math.random() - 0.5);
        const selectedCharities = shuffled.slice(0, 3);

        // Create fundraisers from those charities with logos
        return selectedCharities.map((c, index) => ({
            id: `fundraiser-${c.id}-${index}`,
            title: c.description.length > 50 ? c.description.substring(0, 50) + '...' : c.description,
            amount: String(Math.floor(Math.random() * 5000000) + 500000),
            imageUrl: c.website ? getCharityLogoUrl(c.website) || undefined : undefined,
        }));
    }, [charity?.id]);

    // Mock total amount - in real app this would come from API
    const totalAmount = '1466015133.03';
    const previousAmount = '1465333408.96';
    const participantsCount = 718139;

    const getCategoryColor = (category: Charity['category']) => {
        const colors = {
            humanitarian: 'var(--color-cta)',
            children: 'var(--color-base-violet)',
            environment: 'var(--color-base-green)',
            healthcare: 'var(--color-base-red)',
            education: 'var(--color-base-yellow)',
            other: 'var(--color-shades-60)',
        };
        return colors[category];
    };

    const [logoError, setLogoError] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

    // Reset logo error and loaded state when charity changes
    useEffect(() => {
        setLogoError(false);
        setLogoLoaded(false);
    }, [charity?.id]);

    // Render appropriate page based on current view
    if (currentView === 'amount') {
        return (
            <EnterAmountPage
                recipientAddress={DONATION_WALLET_ADDRESS}
                charityName={charity?.name}
                onBack={handleBackFromAmount}
                onComplete={handleAmountComplete}
            />
        );
    }

    if (currentView === 'confirmation') {
        return (
            <ConfirmationPage
                recipientAddress={DONATION_WALLET_ADDRESS}
                amount={donationAmount}
                currency={selectedCurrency}
                charityName={charity?.name}
                onBack={handleBackFromConfirmation}
                onConfirm={handleConfirmPayment}
            />
        );
    }

    if (currentView === 'success') {
        return (
            <SuccessPage
                recipientAddress={DONATION_WALLET_ADDRESS}
                amount={donationAmount}
                transactionId={paymentFlow.transactionId}
                charityName={charity?.name}
                onDone={handleDone}
            />
        );
    }

    if (currentView === 'failure') {
        return (
            <FailurePage
                recipientAddress={DONATION_WALLET_ADDRESS}
                amount={donationAmount}
                errorMessage={paymentFlow.errorMessage}
                charityName={charity?.name}
                onRetry={handleDonate}
                onCancel={handleDone}
            />
        );
    }

    // Default: show charity detail view
    return (
        <>
            <Background />
            <div className="fixed inset-0 flex flex-col z-50">
                {/* Header */}
                <CharityDetailHeader onShare={handleShare} />

                {/* Content */}
                <div className="flex-1 overflow-y-auto pb-4">
                    {/* Charity Info */}
                    <div className="text-center px-4 mb-6">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-shades-0)] mb-4">
                            {!logoError && getCharityLogoUrl(charity.website) ? (
                                <img
                                    src={getCharityLogoUrl(charity.website)!}
                                    alt={charity.name}
                                    className={`w-16 h-16 rounded-full object-cover bg-white ${logoLoaded ? 'loaded' : ''}`}
                                    onError={(e) => {
                                        console.error('Logo failed to load for', charity.name, ':', e);
                                        setLogoError(true);
                                    }}
                                    onLoad={() => {
                                        console.log('Logo loaded successfully for', charity.name);
                                        setLogoLoaded(true);
                                    }}
                                />
                            ) : (
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                                    style={{
                                        backgroundColor: getCategoryColor(charity.category) + '30',
                                        color: getCategoryColor(charity.category),
                                    }}>
                                    {charity.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Charity Name */}
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h1 className="text-2xl font-bold text-[var(--color-shades-100)]">{charity.name}</h1>
                            {charity.verified && (
                                <span
                                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{
                                        backgroundColor: 'var(--color-base-green)',
                                        color: 'var(--color-shades-0)',
                                    }}>
                                    ✓
                                </span>
                            )}
                        </div>

                        {/* Category Badge */}
                        <span
                            className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                            style={{
                                backgroundColor: getCategoryColor(charity.category) + '20',
                                color: getCategoryColor(charity.category),
                            }}>
                            {charity.category}
                        </span>
                    </div>

                    {/* Currency Selection - Commented out, always using USDC */}
                    {/* <div className="mb-6 px-4">
                        <h3 className="text-[var(--color-shades-100)] font-semibold text-sm mb-3">Select Currency</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {CURRENCIES.map((curr) => (
                                <button
                                    key={curr.value}
                                    onClick={() => setSelectedCurrency(curr.value)}
                                    className={`p-3 rounded-xl font-semibold transition-all flex flex-col items-center gap-1 ${
                                        selectedCurrency === curr.value
                                            ? 'bg-[var(--color-cta)] text-[var(--color-shades-100)] border-2 border-[var(--color-cta)]'
                                            : 'bg-[var(--color-shades-10)] text-[var(--color-shades-80)] border-2 border-[var(--color-shades-30)] hover:border-[var(--color-shades-50)]'
                                    }`}>
                                    <span className="text-xl">{curr.icon}</span>
                                    <span className="text-xs">{curr.label}</span>
                                </button>
                            ))}
                        </div>
                    </div> */}

                    {/* Donation Section */}
                    <div className="mb-6">
                        <DonationSection
                            totalAmount={totalAmount}
                            previousAmount={previousAmount}
                            participantsCount={participantsCount}
                            onDonate={handleDonate}
                        />
                    </div>

                    {/* Monthly Support Section */}
                    <div className="mx-4 mb-6 bg-[var(--color-shades-10)] rounded-2xl p-4 border border-[var(--color-shades-30)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--color-shades-20)] rounded-xl flex items-center justify-center">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="var(--color-shades-80)"
                                    stroke="none">
                                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[var(--color-shades-100)] font-semibold text-base">
                                    Monthly Support
                                </h3>
                                <p className="text-[var(--color-shades-70)] text-sm">Enable auto-donate</p>
                            </div>
                            <button className="text-[var(--color-cta)] text-sm font-semibold">Coming soon</button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mx-4 mb-6">
                        <p className="text-[var(--color-shades-80)] text-base leading-relaxed">
                            {charity.description}
                        </p>
                        {charity.website && (
                            <a
                                href={charity.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--color-cta)] text-sm font-semibold mt-2 inline-block hover:text-opacity-80">
                                Visit Website →
                            </a>
                        )}
                    </div>

                    {/* Active Fundraisers */}
                    <ActiveFundraisers fundraisers={activeFundraisers} />
                </div>
            </div>
        </>
    );
};
