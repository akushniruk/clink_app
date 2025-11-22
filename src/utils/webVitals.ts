import { trackPerformanceMetric } from './analytics';

// Web Vitals tracking utility
export const initializeWebVitals = () => {
    // Track Core Web Vitals when they're available
    if ('PerformanceObserver' in window) {
        // First Contentful Paint (FCP)
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                    trackPerformanceMetric('FCP', entry.startTime);
                }
            }
        });

        try {
            observer.observe({ entryTypes: ['paint'] });
        } catch (error) {
            console.warn('Performance observer not supported for paint metrics');
        }

        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
                const lcpEntry = entries[entries.length - 1];
                trackPerformanceMetric('LCP', lcpEntry.startTime);
            }
        });

        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
            console.warn('Performance observer not supported for LCP metrics');
        }

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'first-input') {
                    const fidEntry = entry as any; // Type assertion for first-input entry
                    const fid = fidEntry.processingStart - fidEntry.startTime;
                    trackPerformanceMetric('FID', fid);
                }
            }
        });

        try {
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            console.warn('Performance observer not supported for FID metrics');
        }

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'layout-shift') {
                    const clsEntry = entry as any; // Type assertion for layout-shift entry
                    if (!clsEntry.hadRecentInput) {
                        clsValue += clsEntry.value;
                    }
                }
            }
        });

        try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('Performance observer not supported for CLS metrics');
        }

        // Track CLS periodically and on page unload
        const trackCLS = () => {
            if (clsValue > 0) {
                trackPerformanceMetric('CLS', clsValue);
            }
        };

        // Track CLS after 10 seconds
        setTimeout(trackCLS, 10000);

        // Track CLS on page unload
        window.addEventListener('beforeunload', trackCLS);
    }

    // Track basic performance metrics
    if ('performance' in window && 'timing' in performance) {
        window.addEventListener('load', () => {
            // Wait a bit for everything to settle
            setTimeout(() => {
                const timing = performance.timing;
                const navigationStart = timing.navigationStart;

                // Page Load Time
                const loadTime = timing.loadEventEnd - navigationStart;
                if (loadTime > 0) {
                    trackPerformanceMetric('page_load_time', loadTime);
                }

                // Time to Interactive (approximation)
                const interactive = timing.domInteractive - navigationStart;
                if (interactive > 0) {
                    trackPerformanceMetric('time_to_interactive', interactive);
                }

                // DNS lookup time
                const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
                if (dnsTime > 0) {
                    trackPerformanceMetric('dns_lookup_time', dnsTime);
                }
            }, 1000);
        });
    }
};

// Track custom performance metrics
export const trackCustomMetric = (metricName: string, value: number) => {
    trackPerformanceMetric(metricName, value);
};

// Track navigation timing
export const trackNavigationTiming = () => {
    const startTime = performance.now();
    return () => {
        const endTime = performance.now();
        const navigationTime = endTime - startTime;
        trackPerformanceMetric('navigation_time', navigationTime);
    };
};
