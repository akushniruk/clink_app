import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import { formatAddress } from '../utils/addressUtils';
import { useT } from '../i18n';
import { config } from '../utils/env';
import { UserIcon } from '@heroicons/react/24/solid';

interface ConfirmationPageProps {
    recipientAddress: string;
    amount: string;
    onBack: () => void;
    onConfirm: () => void;
}

export const ConfirmationPage = ({ recipientAddress, amount, onBack, onConfirm }: ConfirmationPageProps) => {
    const t = useT();
    const [slidePosition, setSlidePosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const confirmationTriggered = useRef(false);

    const calculatePosition = useCallback(
        (clientX: number) => {
            const container = containerRef.current;
            const slider = sliderRef.current;
            if (!container || !slider) return 0;

            const containerRect = container.getBoundingClientRect();
            const maxSlide = containerRect.width - 60 - 8 - 8; // 60px slider width + 8px left padding + 8px right padding
            const newPosition = Math.max(0, Math.min(maxSlide, clientX - containerRect.left - 30 - 8));

            if (newPosition >= maxSlide * 0.9 && !isConfirmed && !isProcessing && !confirmationTriggered.current) {
                // Immediately mark as triggered to prevent multiple calls
                confirmationTriggered.current = true;
                setIsDragging(false);
                setSlidePosition(0);
                setIsConfirmed(true);
                setIsProcessing(true);

                // Call onConfirm and handle the response
                const handleConfirmation = async () => {
                    try {
                        await onConfirm();
                    } finally {
                        setIsProcessing(false);
                    }
                };

                handleConfirmation();
                return 0;
            }

            return newPosition;
        },
        [onConfirm, isConfirmed, isProcessing],
    );

    const handleMove = useCallback(
        (clientX: number) => {
            if (!isDragging || isProcessing) return;
            setSlidePosition(calculatePosition(clientX));
        },
        [isDragging, isProcessing, calculatePosition],
    );

    const handleEnd = useCallback(() => {
        if (isDragging && !isProcessing) {
            setIsDragging(false);
            setSlidePosition(0);
        }
    }, [isDragging, isProcessing]);

    // Mouse events
    const handleMouseMove = useCallback((e: MouseEvent) => handleMove(e.clientX), [handleMove]);
    const handleMouseUp = useCallback(() => handleEnd(), [handleEnd]);

    // Touch events
    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            e.preventDefault();
            handleMove(e.touches[0].clientX);
        },
        [handleMove],
    );

    const handleTouchEnd = useCallback(() => handleEnd(), [handleEnd]);

    const handleStart = useCallback(() => {
        if (!isProcessing) {
            setIsDragging(true);
        }
    }, [isProcessing]);

    // Global event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden">
            <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4">
                    <button onClick={onBack} className="p-4 rounded-sm bg-[var(--color-shades-20)] backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Amount Display - centered in available space */}
                <div className="flex-1 flex flex-col justify-center items-center px-6">
                    <div className="flex flex-col justify-center gap-1 text-white items-center">
                        <span className="text-6xl font-bold">{amount}</span>
                        <span className="text-4xl font-bold uppercase">{config.asset}</span>
                    </div>

                    {/* Recipient Address */}
                    <div className="mt-4 flex items-center space-x-2 border border-[var(--color-shades-30)] mx-auto rounded-4xl px-4 py-1.5">
                        <span className="text-sm text-[var(--color-shades-30)] capitalize font-semibold">
                            {t('payment.to')}
                        </span>
                        <UserIcon className="w-5 h-5 text-[var(--color-shades-30)]" />
                        <span className="text-sm text-white font-medium">{formatAddress(recipientAddress)}</span>
                    </div>
                </div>

                {/* Bottom Section - Slide to Confirm */}
                <div className="flex-shrink-0">
                    <div className="px-6 mb-4">
                        <p className="text-center text-sm text-white font-semibold">
                            {isProcessing ? t('payment.processing') : t('payment.slideToPay')}
                        </p>
                    </div>

                    {/* Slider */}
                    <div className="px-6 pb-6">
                        <div
                            ref={containerRef}
                            className={`relative rounded-2xl border border-[#392E2C] overflow-hidden ${isProcessing ? 'opacity-60' : ''}`}
                            style={{
                                background: '#1D1616',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                height: '76px',
                                pointerEvents: isProcessing ? 'none' : 'auto',
                            }}>
                            {/* Arrow indicators in the track */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex items-center gap-4">
                                    <svg
                                        width="20"
                                        height="10"
                                        viewBox="0 0 20 10"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M15 1L19 5M19 5L15 9M19 5L1 5"
                                            stroke="#F24E4E"
                                            strokeWidth="1.52"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <svg
                                        width="20"
                                        height="10"
                                        viewBox="0 0 20 10"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M15 1L19 5M19 5L15 9M19 5L1 5"
                                            stroke="#F24E4E"
                                            strokeWidth="1.52"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <svg
                                        width="20"
                                        height="10"
                                        viewBox="0 0 20 10"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M15 1L19 5M19 5L15 9M19 5L1 5"
                                            stroke="#F24E4E"
                                            strokeWidth="1.52"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Left Side - Red Button (60x60) - Centered vertically with 8px left padding */}
                            <div
                                ref={sliderRef}
                                className={`absolute rounded-2xl flex items-center justify-center z-10
                                    ${isProcessing ? 'cursor-not-allowed' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    top: '8px', // Center vertically: (76 - 60) / 2 = 8px
                                    left: '8px', // 8px padding from left
                                    transform: `translateX(${slidePosition}px)`,
                                    opacity: isProcessing ? 0.6 : 1,
                                }}
                                onMouseDown={handleStart}
                                onTouchStart={handleStart}>
                                {isProcessing ? (
                                    /* Loading Spinner */
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    /* Red Button SVG */
                                    <svg
                                        width="60"
                                        height="60"
                                        viewBox="0 0 60 60"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <g filter="url(#filter0_ddd_103_3546)">
                                            <path
                                                d="M0 8C0 3.58172 3.58172 0 8 0H52C56.4183 0 60 3.58172 60 8V52C60 56.4183 56.4183 60 52 60H8C3.58172 60 0 56.4183 0 52V8Z"
                                                fill="#A80000"
                                            />
                                        </g>
                                        <path
                                            d="M14 16C14 15.4477 14.4477 15 15 15C15.5523 15 16 15.4477 16 16V44C16 44.5523 15.5523 45 15 45C14.4477 45 14 44.5523 14 44V16Z"
                                            fill="#FDFCFC"
                                        />
                                        <path
                                            d="M22 16C22 15.4477 22.4477 15 23 15C23.5523 15 24 15.4477 24 16V44C24 44.5523 23.5523 45 23 45C22.4477 45 22 44.5523 22 44V16Z"
                                            fill="#FDFCFC"
                                        />
                                        <path
                                            d="M30 16C30 15.4477 30.4477 15 31 15C31.5523 15 32 15.4477 32 16V44C32 44.5523 31.5523 45 31 45C30.4477 45 30 44.5523 30 44V16Z"
                                            fill="#FDFCFC"
                                        />
                                        <path
                                            d="M38 16C38 15.4477 38.4477 15 39 15C39.5523 15 40 15.4477 40 16V44C40 44.5523 39.5523 45 39 45C38.4477 45 38 44.5523 38 44V16Z"
                                            fill="#FDFCFC"
                                        />
                                        <path
                                            d="M46 16C46 15.4477 46.4477 15 47 15C47.5523 15 48 15.4477 48 16V44C48 44.5523 47.5523 45 47 45C46.4477 45 46 44.5523 46 44V16Z"
                                            fill="#FDFCFC"
                                        />
                                        <defs>
                                            <filter
                                                id="filter0_ddd_103_3546"
                                                x="0"
                                                y="0"
                                                width="60"
                                                height="60"
                                                filterUnits="userSpaceOnUse"
                                                colorInterpolationFilters="sRGB">
                                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                <feColorMatrix
                                                    in="SourceAlpha"
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                    result="hardAlpha"
                                                />
                                                <feOffset />
                                                <feGaussianBlur stdDeviation="1" />
                                                <feColorMatrix
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
                                                />
                                                <feBlend
                                                    mode="normal"
                                                    in2="BackgroundImageFix"
                                                    result="effect1_dropShadow_103_3546"
                                                />
                                                <feColorMatrix
                                                    in="SourceAlpha"
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                    result="hardAlpha"
                                                />
                                                <feMorphology
                                                    radius="3"
                                                    operator="erode"
                                                    in="SourceAlpha"
                                                    result="effect2_dropShadow_103_3546"
                                                />
                                                <feOffset dy="10" />
                                                <feGaussianBlur stdDeviation="7.5" />
                                                <feColorMatrix
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
                                                />
                                                <feBlend
                                                    mode="normal"
                                                    in2="effect1_dropShadow_103_3546"
                                                    result="effect2_dropShadow_103_3546"
                                                />
                                                <feColorMatrix
                                                    in="SourceAlpha"
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                    result="hardAlpha"
                                                />
                                                <feMorphology
                                                    radius="2"
                                                    operator="erode"
                                                    in="SourceAlpha"
                                                    result="effect3_dropShadow_103_3546"
                                                />
                                                <feOffset dy="4" />
                                                <feGaussianBlur stdDeviation="3" />
                                                <feColorMatrix
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
                                                />
                                                <feBlend
                                                    mode="normal"
                                                    in2="effect2_dropShadow_103_3546"
                                                    result="effect3_dropShadow_103_3546"
                                                />
                                                <feBlend
                                                    mode="normal"
                                                    in="SourceGraphic"
                                                    in2="effect3_dropShadow_103_3546"
                                                    result="shape"
                                                />
                                            </filter>
                                        </defs>
                                    </svg>
                                )}
                            </div>

                            {/* Right Side - Dotted Border Pattern (60x60) - With 8px padding */}
                            <div
                                className="absolute rounded-2xl flex items-center justify-center pointer-events-none"
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    top: '8px', // 8px padding from top
                                    right: '8px', // 8px padding from right
                                    opacity: slidePosition > 0 ? 1 : 0.3,
                                }}>
                                <svg
                                    width="60"
                                    height="60"
                                    viewBox="0 0 60 60"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M49.25 0V0.5H52C53.0179 0.5 53.9875 0.702916 54.8711 1.06934L55.0615 0.607422C57.0171 1.41819 58.5805 2.9821 59.3916 4.9375L58.9307 5.12891C59.2971 6.01252 59.5 6.98214 59.5 8V10.75H60V16.25H59.5V21.75H60V27.25H59.5V32.75H60V38.25H59.5V43.75H60V49.25H59.5V52C59.5 53.0179 59.2971 53.9875 58.9307 54.8711L59.3916 55.0615C58.5807 57.0172 57.0172 58.5807 55.0615 59.3916L54.8711 58.9307C53.9875 59.2971 53.0179 59.5 52 59.5H49.25V60H43.75V59.5H38.25V60H32.75V59.5H27.25V60H21.75V59.5H16.25V60H10.75V59.5H8C6.98214 59.5 6.01252 59.2971 5.12891 58.9307L4.9375 59.3916C2.9821 58.5805 1.41819 57.0171 0.607422 55.0615L1.06934 54.8711C0.702916 53.9875 0.5 53.0179 0.5 52V49.25H0V43.75H0.5V38.25H0V32.75H0.5V27.25H0V21.75H0.5V16.25H0V10.75H0.5V8C0.5 6.98214 0.702916 6.01252 1.06934 5.12891L0.607422 4.9375C1.41834 2.98222 2.98222 1.41834 4.9375 0.607422L5.12891 1.06934C6.01252 0.702916 6.98214 0.5 8 0.5H10.75V0H16.25V0.5H21.75V0H27.25V0.5H32.75V0H38.25V0.5H43.75V0H49.25Z"
                                        fill="#392E2C"
                                        stroke="#887674"
                                        strokeDasharray="6 6"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
