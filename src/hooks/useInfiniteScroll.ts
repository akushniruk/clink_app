import { useEffect, useCallback } from 'preact/hooks';
import { type RefObject } from 'preact';

interface UseInfiniteScrollOptions {
    scrollRef: RefObject<HTMLElement>;
    onLoadMore: () => void;
    threshold?: number; // percentage of scroll before triggering
}

export const useInfiniteScroll = ({
    scrollRef,
    onLoadMore,
    threshold = 80, // default threshold at 80%
}: UseInfiniteScrollOptions) => {
    const handleScroll = useCallback(() => {
        const element = scrollRef.current;

        if (!element) return;

        const { scrollTop, scrollHeight, clientHeight } = element;

        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        if (scrollPercentage >= threshold) {
            onLoadMore();
        }
    }, [scrollRef, onLoadMore, threshold]);

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        element.addEventListener('scroll', handleScroll);

        return () => {
            element.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);
};
