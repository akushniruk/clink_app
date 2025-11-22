import { Background } from '../components/ui/Background';
import { Button } from '../components/ui';
import { formatAddress } from '../utils/addressUtils';
import { useT } from '../i18n';
import { config } from '../utils/env';
import { useMemo } from 'preact/hooks';

interface FailurePageProps {
    recipientAddress: string;
    amount: string;
    errorMessage?: string;
    onRetry: () => void;
    onCancel: () => void;
}

export const FailurePage = ({ recipientAddress, amount, onCancel, errorMessage }: FailurePageProps) => {
    const t = useT();
    const errorMessageKey = useMemo(() => {
        if (!errorMessage) return 'payment.error.default';

        const lowerError = errorMessage.toLowerCase();

        if (lowerError.includes('failed to get wallet by tag')) {
            return 'payment.error.tag';
        }
        if (lowerError.includes('insufficient') || lowerError.includes('balance')) {
            return 'payment.error.insufficient';
        }
        if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
            return 'payment.error.timeout';
        }
        return lowerError.length > 60 ? 'payment.error.unknown' : 'payment.error.default';
    }, [errorMessage]);

    const centerGlowStyle = {
        position: 'absolute' as const,
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 260,
        height: 260,
        borderRadius: '50%',
        pointerEvents: 'none' as const,
        backdropFilter: 'blur(70px)',
        WebkitBackdropFilter: 'blur(70px)',
        maskImage: 'linear-gradient(to top, transparent 0%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 100%)',
        backgroundColor: 'var(--color-error)',
        opacity: 0.7,
        zIndex: 2,
    };

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden">
            <Background />
            <div style={centerGlowStyle} />

            <div className="relative z-10 h-full flex flex-col">
                {/* Header with Icon */}
                <div className="flex-shrink-0 flex items-center justify-center pt-8 pb-4">
                    <svg width="228" height="228" viewBox="0 0 228 228" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.7" filter="url(#filter0_f_2043_5616)">
                            <circle cx="114" cy="114" r="73.9999" fill="#F25E4E" />
                        </g>
                        <path
                            d="M182.307 159.183L123.691 50.1778C119.537 42.4492 108.469 42.4492 104.311 50.1778L45.6991 159.183C44.797 160.861 44.3447 162.744 44.3864 164.649C44.4281 166.555 44.9624 168.416 45.937 170.053C46.9116 171.689 48.2933 173.045 49.9473 173.987C51.6012 174.93 53.4709 175.426 55.3737 175.429H172.615C174.519 175.429 176.391 174.935 178.047 173.994C179.704 173.053 181.088 171.697 182.064 170.06C183.041 168.423 183.577 166.56 183.619 164.654C183.662 162.747 183.209 160.862 182.307 159.183ZM114.003 158.553C112.642 158.553 111.313 158.149 110.181 157.392C109.05 156.635 108.169 155.559 107.648 154.301C107.127 153.042 106.991 151.657 107.256 150.321C107.522 148.985 108.177 147.757 109.139 146.794C110.101 145.831 111.327 145.175 112.661 144.909C113.995 144.643 115.378 144.78 116.635 145.301C117.892 145.822 118.966 146.705 119.722 147.838C120.478 148.971 120.881 150.302 120.881 151.665C120.881 153.492 120.157 155.244 118.867 156.535C117.577 157.827 115.827 158.553 114.003 158.553ZM121.473 89.2751L119.499 131.293C119.499 132.754 118.919 134.156 117.887 135.19C116.855 136.223 115.455 136.804 113.996 136.804C112.537 136.804 111.137 136.223 110.105 135.19C109.073 134.156 108.493 132.754 108.493 131.293L106.519 89.2923C106.475 88.2886 106.633 87.2863 106.983 86.3451C107.334 85.4038 107.87 84.5429 108.56 83.8137C109.25 83.0844 110.08 82.5018 111 82.1004C111.919 81.6991 112.91 81.4873 113.913 81.4776H113.986C114.996 81.4771 115.995 81.6815 116.924 82.0785C117.853 82.4755 118.692 83.0569 119.391 83.7875C120.089 84.5181 120.632 85.3829 120.988 86.3296C121.343 87.2763 121.504 88.2853 121.459 89.2957L121.473 89.2751Z"
                            fill="#F25E4E"
                        />
                        <defs>
                            <filter
                                id="filter0_f_2043_5616"
                                x="0"
                                y="0"
                                width="228"
                                height="228"
                                filterUnits="userSpaceOnUse"
                                colorInterpolationFilters="sRGB"
                            >
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur_2043_5616" />
                            </filter>
                        </defs>
                    </svg>
                </div>

                {/* Content - centered in available space */}
                <div className="flex-1 flex flex-col items-center px-6">
                    {/* Amount Display */}
                    <div className="flex gap-1 text-white items-start mb-6">
                        <span className="text-6xl font-bold">{amount}</span>
                        <span className="text-2xl font-bold self-end mb-2 uppercase">{config.asset}</span>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-xl font-semibold text-[var(--color-base-red)] mb-2">{t(errorMessageKey)}</h1>

                    <div className="flex flex-row justify-between items-center w-full py-4 mt-12 border-y border-[var(--color-cta-4)] text-sm">
                        <span className="font-semibold text-[var(--color-shades-50)]">{t('payment.receiver')}</span>
                        <div className="font-semibold text-[var(--color-base-red)]">
                            {formatAddress(recipientAddress)}
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Close Button */}
                <div className="flex-shrink-0">
                    <div className="px-6 pb-6">
                        <Button onClick={onCancel} variant="primary" size="lg" fullWidth>
                            {t('common.close')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
