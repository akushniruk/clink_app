import { useState, useEffect } from 'preact/hooks';
import type { OnboardingStoriesProps } from './types';
import { Story } from './Story';
import { STORIES, STORAGE_KEY } from './constants';
import { trackOnboardingStarted } from '../../utils/analytics';

export const OnboardingStories = ({ onComplete }: OnboardingStoriesProps) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Track onboarding started when component mounts
    useEffect(() => {
        trackOnboardingStarted('first_time');
    }, []);

    const handleNext = () => {
        if (currentStoryIndex < STORIES.length - 1) {
            setCurrentStoryIndex((prev) => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, 'true');
        onComplete();
    };

    if (!isVisible) return null;

    return (
        <>
            {STORIES.map((story, index) => (
                <Story
                    key={story.id}
                    story={story}
                    isActive={index === currentStoryIndex}
                    onNext={handleNext}
                    onSkip={handleSkip}
                    currentIndex={currentStoryIndex}
                    totalStories={STORIES.length}
                />
            ))}
        </>
    );
};
