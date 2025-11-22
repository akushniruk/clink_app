import { useEffect, useState } from 'preact/hooks';

/**
 * Detects if the current session runs in a mobile webkit instance.
 * Mobile webkit has the viewport height bug where 100vh includes the browser UI,
 * causing content to be cut off when the URL bar is visible.
 */
export function isMobileWebkit(): boolean {
    if (typeof window === 'undefined') return false;

    const ua = window.navigator.userAgent;
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const webkit = !!ua.match(/WebKit/i);

    // Exclude Chrome on iOS as it handles viewport differently
    return iOS && webkit && !ua.match(/CriOS/i);
}

/**
 * Hook to detect mobile webkit after component mounting.
 * Needed for SSR compatibility where window is undefined on server.
 */
export function useIsMobileWebkit(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(isMobileWebkit());
    }, []);

    return isMobile;
}

/**
 * Sets CSS custom properties for proper viewport height handling.
 * Should be called once on app initialization.
 * @returns A cleanup function to remove the event listener.
 */
export function setViewportHeightProperties(): (() => void) | void {
    if (typeof window === 'undefined') return;

    const setHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // Set fill-available for webkit
        if (isMobileWebkit()) {
            document.documentElement.style.setProperty('--viewport-height', '-webkit-fill-available');
        } else {
            document.documentElement.style.setProperty('--viewport-height', '100vh');
        }
    };

    // Set initial height
    setHeight();

    // Update on resize
    window.addEventListener('resize', setHeight);

    // Clean up function
    return () => window.removeEventListener('resize', setHeight);
}

/**
 * Hook to initialize viewport height properties.
 * Automatically sets up and cleans up event listeners.
 */
export function useViewportHeight(): void {
    useEffect(() => {
        const cleanup = setViewportHeightProperties();
        return cleanup;
    }, []);
}
