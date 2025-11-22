import { useState, useCallback } from 'preact/hooks';

export interface ViewNavigationActions<T extends string> {
    setCurrentView: (view: T) => void;
    goBack: () => void;
    goForward: () => void;
    resetToInitial: () => void;
}

export interface ViewNavigationState<T extends string> {
    currentView: T;
    canGoBack: boolean;
    canGoForward: boolean;
    history: T[];
}

export interface ViewNavigationConfig<T extends string> {
    initialView: T;
    maxHistorySize?: number;
    onViewChange?: (view: T, previousView: T | null) => void;
}

export const useViewNavigation = <T extends string>(
    config: ViewNavigationConfig<T>,
): ViewNavigationState<T> & ViewNavigationActions<T> => {
    const { initialView, maxHistorySize = 10, onViewChange } = config;

    const [currentView, setCurrentViewState] = useState<T>(initialView);
    const [history, setHistory] = useState<T[]>([initialView]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const setCurrentView = useCallback(
        (view: T) => {
            const previousView = currentView;

            // Add to history if it's a new view (not back/forward navigation)
            setHistory((prev) => {
                const newHistory = [...prev.slice(0, historyIndex + 1), view];
                // Limit history size
                if (newHistory.length > maxHistorySize) {
                    return newHistory.slice(-maxHistorySize);
                }
                return newHistory;
            });

            setHistoryIndex((prev) => Math.min(prev + 1, maxHistorySize - 1));
            setCurrentViewState(view);

            // Call callback if provided
            onViewChange?.(view, previousView);
        },
        [currentView, historyIndex, maxHistorySize, onViewChange],
    );

    const goBack = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const previousView = history[newIndex];
            setHistoryIndex(newIndex);
            setCurrentViewState(previousView);
            onViewChange?.(previousView, currentView);
        }
    }, [historyIndex, history, currentView, onViewChange]);

    const goForward = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextView = history[newIndex];
            setHistoryIndex(newIndex);
            setCurrentViewState(nextView);
            onViewChange?.(nextView, currentView);
        }
    }, [historyIndex, history, currentView, onViewChange]);

    const resetToInitial = useCallback(() => {
        setCurrentViewState(initialView);
        setHistory([initialView]);
        setHistoryIndex(0);
        onViewChange?.(initialView, currentView);
    }, [initialView, currentView, onViewChange]);

    return {
        currentView,
        canGoBack: historyIndex > 0,
        canGoForward: historyIndex < history.length - 1,
        history,
        setCurrentView,
        goBack,
        goForward,
        resetToInitial,
    };
};
