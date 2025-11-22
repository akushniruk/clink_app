import type { StoryData } from './types';

export const STORY_DURATION = 5000;
export const PROGRESS_UPDATE_INTERVAL = 16;

export const STORIES: StoryData[] = [
    {
        id: 'welcome',
        number: '1',
        color: 'text-base-red',
        glowColor: 'bg-base-red',
    },
    {
        id: 'topUp',
        number: '2',
        color: 'text-base-green',
        glowColor: 'bg-base-green',
    },
    {
        id: 'getDrink',
        number: '3',
        color: 'text-base-violet',
        glowColor: 'bg-base-violet',
    },
];

export const STORAGE_KEY = 'clink-onboarding-completed';
