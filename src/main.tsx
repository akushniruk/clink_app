// Buffer polyfill MUST be first - before any other imports
import { Buffer } from 'buffer';

// Set up global polyfills immediately
if (typeof globalThis !== 'undefined') {
    (globalThis as any).Buffer = Buffer;
    if (!(globalThis as any).process) {
        (globalThis as any).process = {
            nextTick: (fn: any) => setTimeout(fn, 0),
            env: {},
            version: 'v16.0.0',
            versions: { node: '16.0.0' },
        };
    }
}
if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
    if (!(window as any).process) {
        (window as any).process = (globalThis as any).process;
    }
}

import { render } from 'preact';
import { App } from './app.tsx';
import { setViewportHeightProperties } from './utils/viewport.ts';
import './index.css';

// Initialize viewport height properties for mobile webkit fix
setViewportHeightProperties();

// Render app first - analytics can wait
const appElement = document.getElementById('app')!;
render(<App />, appElement);

// Signal that the app has mounted (for loading screen transition)
window.dispatchEvent(new Event('app-mounted'));

// Initialize analytics, service worker, and prefetch non-critical resources after app load
requestIdleCallback(
    () => {
        // Register service worker during idle time for better performance
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((error) => {
                    console.log('SW registration failed: ', error);
                });
        }

        // Initialize Google Analytics during idle time
        import('./utils/initAnalytics')
            .then(({ initGoogleAnalytics }) => {
                initGoogleAnalytics();
            })
            .catch(() => {});

        // Prefetch additional routes/components when idle
        import('./utils/env.ts').catch(() => {});
        import('./performance/usePerformance.ts').catch(() => {});
    },
    { timeout: 2000 },
);
