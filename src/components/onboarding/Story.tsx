// Story.tsx
import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import type { StoryProps } from './types';
import { STORY_DURATION } from './constants';
import { useTranslation } from '../../i18n';
import { trackOnboardingStep } from '../../utils/analytics';

// Pre-computed gradient styles for better performance
const STORY_GRADIENTS = {
    discover: 'linear-gradient(180deg, rgba(56, 4, 4, 0.6) 0%, rgba(121, 29, 29, 0.6) 100%), #000',
    donate: 'linear-gradient(180deg, rgba(56, 16, 4, 0.6) 0%, rgba(87, 121, 29, 0.6) 100%), #000',
    track: 'linear-gradient(180deg, rgba(56, 16, 4, 0.6) 0%, rgba(69, 13, 117, 0.6) 100%), #000',
} as const;

const STORY_COLORS = {
    discover: 'var(--color-cta)',
    donate: '#B6F24E',
    track: '#9F54FC',
} as const;

const BADGE_STYLES = {
    discover: {
        bg: 'var(--color-cta-4)',
        border: 'var(--color-cta-2)',
        color: 'var(--color-base-red)',
    },
    donate: {
        bg: 'rgba(182, 242, 78, 0.15)',
        border: 'rgba(182, 242, 78, 0.35)',
        color: '#B6F24E',
    },
    track: {
        bg: 'rgba(159, 84, 252, 0.15)',
        border: 'rgba(159, 84, 252, 0.35)',
        color: '#9F54FC',
    },
} as const;

export const Story = ({ story, isActive, onNext, currentIndex, totalStories }: StoryProps) => {
    const [progress, setProgress] = useState(0);
    const { t } = useTranslation();

    // Memoized style calculations
    const backgroundGradient = useMemo(
        () => STORY_GRADIENTS[story.id as keyof typeof STORY_GRADIENTS] || STORY_GRADIENTS.discover,
        [story.id],
    );

    const centerGlowColor = useMemo(
        () => STORY_COLORS[story.id as keyof typeof STORY_COLORS] || STORY_COLORS.discover,
        [story.id],
    );

    const badgeStyle = useMemo(
        () => BADGE_STYLES[story.id as keyof typeof BADGE_STYLES] || BADGE_STYLES.discover,
        [story.id],
    );

    // Optimized progress update with RAF
    useEffect(() => {
        if (!isActive) {
            setProgress(0);
            return;
        }

        const start = performance.now();
        let rafId: number;

        const updateProgress = () => {
            const elapsed = performance.now() - start;
            const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                // Track auto-completion of story
                trackOnboardingStep(
                    currentIndex + 1,
                    t(`onboarding.${story.id}.title`),
                    story.id,
                    undefined, // No user ID available at this stage
                );
                onNext();
            } else {
                rafId = requestAnimationFrame(updateProgress);
            }
        };

        rafId = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(rafId);
    }, [isActive, onNext]);

    const handleTap = useCallback(() => {
        // Track story completion
        trackOnboardingStep(
            currentIndex + 1,
            t(`onboarding.${story.id}.title`),
            story.id,
            undefined, // No user ID available at this stage
        );
        onNext();
    }, [onNext, currentIndex, story.id, t]);

    if (!isActive) return null;

    // Static styles for better performance
    const containerStyle = { background: backgroundGradient };
    const bottomGlowStyle = {
        position: 'absolute' as const,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--color-cta)',
        borderRadius: 288,
        filter: 'blur(127.98px)',
        height: 576,
        opacity: 0.25,
        width: 576,
        zIndex: 1,
        pointerEvents: 'none' as const,
    };

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
        backgroundColor: centerGlowColor,
        opacity: 0.7,
        zIndex: 2,
    };

    const numberStyle = {
        position: 'absolute' as const,
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Sora, Helvetica',
        fontSize: '30rem',
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: '-0.71px',
        color: centerGlowColor,
        zIndex: 3,
    };

    const blurOverlayStyle = {
        position: 'absolute' as const,
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 600,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        pointerEvents: 'none' as const,
        zIndex: 5,
    };

    return (
        <div
            class="fixed inset-0 z-50 flex flex-col text-shades-100 overflow-hidden"
            style={containerStyle}
            onClick={handleTap}
        >
            <div style={bottomGlowStyle} />

            <div class="absolute top-0 left-0 right-0 flex gap-1 p-2 pt-4 z-20">
                {Array.from({ length: totalStories }, (_, index) => (
                    <div key={index} class="flex-1 h-2.5 bg-cta-3 rounded-full overflow-hidden">
                        <div
                            class="h-full bg-cta transition-all duration-100 ease-linear"
                            style={{
                                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                            }}
                        />
                    </div>
                ))}
            </div>

            <div class="relative w-full h-full flex items-center justify-center">
                <div style={centerGlowStyle} />
                <div style={numberStyle}>{story.number}</div>
                <div style={blurOverlayStyle} />
            </div>

            <div class="absolute bottom-30 left-6 right-6 z-10 flex flex-col gap-3">
                <div
                    class="inline-flex items-center rounded-full gap-3 justify-center py-1 px-3.5 w-fit"
                    style={{
                        backgroundColor: badgeStyle.bg,
                        border: `1px solid ${badgeStyle.border}`,
                    }}
                >
                    <span
                        class="text-xs font-bold tracking-wide leading-tight whitespace-nowrap"
                        style={{
                            color: badgeStyle.color,
                            fontFamily: 'Sora, Helvetica',
                        }}
                    >
                        {t(`onboarding.${story.id}.title`)}
                    </span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <h1
                        class="text-2xl font-bold leading-7 m-0 text-shades-100"
                        style={{ fontFamily: 'Sora, Helvetica' }}
                    >
                        {t(`onboarding.${story.id}.subtitle`)}
                    </h1>
                    <p
                        class="text-base font-semibold leading-5 m-0 text-shades-80"
                        style={{ fontFamily: 'Sora, Helvetica' }}
                    >
                        {t(`onboarding.${story.id}.description`)}
                    </p>
                </div>
            </div>
        </div>
    );
};
