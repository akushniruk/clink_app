import { useEffect } from 'preact/hooks';

// Performance monitoring hook
export function usePerformance() {
    useEffect(() => {
        // Web Vitals tracking
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries[entries.length - 1];
                // LCP measured
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach((entry) => {
                    const fidEntry = entry as PerformanceEventTiming;
                    if (fidEntry.processingStart) {
                        // FID measured
                    }
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!(entry as any).hadRecentInput) {
                        clsValue += (entry as any).value;
                    }
                }
                // CLS measured
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            return () => {
                lcpObserver.disconnect();
                fidObserver.disconnect();
                clsObserver.disconnect();
            };
        }
    }, []);
}

// Resource loading optimization
export function preloadCriticalResources(): void {
    // Preload critical images
    const criticalImages = ['/icons/icon-192x192.png'];

    criticalImages.forEach((src) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Network-aware loading
export function getNetworkInfo(): {
    effectiveType: string;
    downlink: number;
    saveData: boolean;
} {
    const nav = navigator as any;

    return {
        effectiveType: nav.connection?.effectiveType || '4g',
        downlink: nav.connection?.downlink || 10,
        saveData: nav.connection?.saveData || false,
    };
}
