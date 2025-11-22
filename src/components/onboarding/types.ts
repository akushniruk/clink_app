export interface StoryData {
    id: string;
    number: string;
    color: string;
    glowColor: string;
}

export interface OnboardingStoriesProps {
    onComplete: () => void;
}

export interface StoryProps {
    story: StoryData;
    isActive: boolean;
    onNext: () => void;
    onSkip: () => void;
    currentIndex: number;
    totalStories: number;
}
