import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
    const isProduction = command === 'build';
    const isDevelopment = command === 'serve';

    return {
        resolve: {
            alias: {
                // Map React imports to Preact for React-based packages
                react: 'preact/compat',
                'react-dom': 'preact/compat',
                // Buffer polyfill for crypto libraries
                buffer: 'buffer',
            },
        },
        define: {
            global: 'globalThis',
            // Environment-specific definitions
            __DEV__: isDevelopment,
            'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
        },
        optimizeDeps: {
            include: ['buffer'],
            force: true,
        },
        // Exclude Solana dependencies since we don't use Solana
        external: ['@solana/web3.js', '@solana/spl-token'],
        server: {
            host: '0.0.0.0',
            port: 5173,
        },
        preview: {
            host: '0.0.0.0',
            port: 4173,
            allowedHosts: true,
        },
        build: {
            target: 'es2020', // Required for BigInt support
            cssTarget: 'chrome61',
            minify: 'esbuild', // Disable minification to prevent constructor issues
            // Enable modern optimizations for chunk loading
            modulePreload: {
                polyfill: false, // Disable polyfill for modern browsers
            },
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info', 'console.warn'],
                    // Enhanced dead code elimination
                    dead_code: true,
                    unused: true,
                    pure_getters: true,
                    passes: 3, // Multiple passes for better optimization
                    unsafe_arrows: true,
                    unsafe_methods: true,
                    // Safe size optimizations (removed booleans_as_integers for Web3 compatibility)
                    collapse_vars: true,
                    reduce_vars: true,
                },
                format: {
                    comments: false,
                },
                // Handle BigInt properly
                ecma: 2020,
            },
            cssCodeSplit: true, // Enable CSS code splitting
            rollupOptions: {
                // Enhanced tree shaking configuration
                treeshake: {
                    preset: 'recommended',
                    moduleSideEffects: false, // Assume no side effects for better tree shaking
                    propertyReadSideEffects: false,
                    tryCatchDeoptimization: false,
                },
                // Handle circular dependencies
                onwarn(warning, warn) {
                    // Ignore circular dependency warnings for specific packages
                    if (
                        warning.code === 'CIRCULAR_DEPENDENCY' &&
                        (warning.message?.includes('ox') ||
                            warning.message?.includes('noble') ||
                            warning.message?.includes('crypto') ||
                            warning.message?.includes('privy'))
                    ) {
                        return;
                    }
                    // Ignore this warning for privy modules
                    if (warning.code === 'THIS_IS_UNDEFINED' && warning.message?.includes('privy')) {
                        return;
                    }
                    warn(warning);
                },
                // Modern chunk optimization to prevent synchronous waterfalls
                maxParallelFileOps: 5, // Limit concurrent operations
                output: {
                    // Simplified chunking to avoid cross-dependency issues
                    manualChunks: {
                        // Only separate Preact to avoid all dependency issues
                        vendor: ['preact'],
                    },

                    // Optimize file names and caching
                    chunkFileNames: (chunkInfo) => {
                        const name = chunkInfo.name;
                        // Critical chunks get priority naming
                        if (name === 'vendor' || name.startsWith('vendor-') || name.startsWith('i18n-')) {
                            return 'js/[name]-[hash].js';
                        }
                        // Async chunks get descriptive names
                        return 'js/async/[name]-[hash].js';
                    },
                    entryFileNames: 'js/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        const name = assetInfo.names?.[0] || 'asset';
                        const info = name.split('.');
                        const ext = info[info.length - 1];
                        if (/\.(css)$/.test(name)) {
                            return `css/[name]-[hash].${ext}`;
                        }
                        return `assets/[name]-[hash].${ext}`;
                    },
                },
            },
            reportCompressedSize: true,
            chunkSizeWarningLimit: 200, // 200kb warning for better performance
        },
        plugins: [
            preact(),
            tailwindcss(),
            VitePWA({
                registerType: 'autoUpdate',
                strategies: 'generateSW',
                injectRegister: false, // Manual registration for better performance
                includeAssets: [], // Exclude everything - no manifest preloading
                workbox: {
                    skipWaiting: true,
                    clientsClaim: true,
                    cleanupOutdatedCaches: true,
                    // Manual list - only cache absolutely critical files (EXCLUDE ALL ICONS & I18N)
                    globPatterns: [
                        'index.html',
                        'offline.html',
                        'css/index-*.css',
                        'js/index-*.js',
                        'js/vendor-*.js',
                    ],
                    globIgnores: [
                        '**/stats.html',
                        '**/icons/**', // Exclude ALL icons from precaching for parallel loading
                        '**/*.ico', // Exclude favicon from precaching
                        '**/*.png', // Exclude all PNG files (icons)
                        '**/*.svg', // Exclude all SVG files
                        '**/*.webmanifest', // Exclude manifest from precaching
                        'js/i18n-*.js', // Exclude i18n files for parallel loading
                        'js/async/**', // Exclude all async chunks
                    ],
                    manifestTransforms: [
                        // Custom transform to remove icon entries
                        (manifestEntries) => {
                            const filteredEntries = manifestEntries.filter((entry) => {
                                return (
                                    !entry.url.includes('icon-') &&
                                    !entry.url.includes('favicon') &&
                                    !entry.url.includes('.png') &&
                                    !entry.url.includes('.ico') &&
                                    !entry.url.includes('manifest.webmanifest')
                                );
                            });
                            return { manifest: filteredEntries };
                        },
                    ],
                    maximumFileSizeToCacheInBytes: 10485760, // 10MB max for demo
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-stylesheets',
                                expiration: {
                                    maxEntries: 5,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                                },
                            },
                        },
                        {
                            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-webfonts',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                                },
                            },
                        },
                        {
                            // Cache Web3 bundle chunk on demand (large: 3MB+)
                            urlPattern: /\/js\/async\/web3-bundle-.*\.js$/,
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'web3-bundle-chunk',
                                expiration: {
                                    maxEntries: 3,
                                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                                },
                            },
                        },
                        {
                            // Cache Web3 connectors chunk on demand
                            urlPattern: /\/js\/async\/web3-connectors-.*\.js$/,
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'web3-connectors-chunk',
                                expiration: {
                                    maxEntries: 3,
                                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                                },
                            },
                        },
                        {
                            // Cache QR generation chunk - loads after login
                            urlPattern: /\/js\/async\/qr-generation-.*\.js$/,
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'qr-generation-chunk',
                                expiration: {
                                    maxEntries: 3,
                                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                                },
                            },
                        },
                        {
                            // Cache QR scanning chunk - loads when scanning needed (large: 130KB+)
                            urlPattern: /\/js\/async\/qr-scanning-.*\.js$/,
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'qr-scanning-chunk',
                                expiration: {
                                    maxEntries: 3,
                                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                                },
                            },
                        },
                        {
                            // Cache buffer polyfills chunk - loads for crypto operations
                            urlPattern: /\/js\/async\/buffer-polyfills-.*\.js$/,
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'buffer-polyfills-chunk',
                                expiration: {
                                    maxEntries: 3,
                                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                                },
                            },
                        },
                        {
                            // Cache blockchain utilities chunk on demand
                            urlPattern: /\/js\/async\/blockchain-rpc-.*\.js$/,
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'blockchain-rpc-chunk',
                                expiration: {
                                    maxEntries: 3,
                                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                                },
                            },
                        },
                        {
                            // LAZY icon loading - cache on demand only (NO PRELOADING)
                            urlPattern: /\.(ico|png|svg|webmanifest)$/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'pwa-assets-lazy',
                                expiration: {
                                    maxEntries: 5, // Minimal icon cache
                                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                                },
                                // NO requestWillFetch plugin - no aggressive preloading
                            },
                        },
                        {
                            // Cache i18n files on-demand for parallel loading (not precached)
                            urlPattern: /\/js\/i18n-.*\.js$/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'i18n-chunks-lazy',
                                expiration: {
                                    maxEntries: 5, // en, ua, fr + future languages
                                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                                },
                            },
                        },
                        {
                            // Cache offline page asynchronously - loaded when needed
                            urlPattern: /\/offline\.html$/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'offline-fallback',
                                expiration: {
                                    maxEntries: 1,
                                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                                },
                            },
                        },
                    ],
                },
                manifest: {
                    name: 'Clink',
                    short_name: 'Clink',
                    description: 'A next-generation charity platform using blockchain for transparency and accountability. Make fast, secure donations and see exactly where your contribution goes',
                    lang: 'en',
                    theme_color: '#000',
                    background_color: '#000',
                    display: 'standalone',
                    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
                    orientation: 'portrait-primary',
                    scope: '/',
                    start_url: '/?source=pwa',
                    id: '/?source=pwa',
                    categories: ['finance', 'social'],
                    prefer_related_applications: false,
                    icons: [
                        {
                            src: 'icons/icon-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: 'icons/icon-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                        },
                    ],
                    screenshots: [
                        {
                            src: 'logo.png',
                            sizes: '512x512',
                            type: 'image/png',
                            form_factor: 'narrow',
                            label: 'Clink Home Screen',
                        },
                        {
                            src: 'qr-logo.png',
                            sizes: '512x512',
                            type: 'image/png',
                            form_factor: 'narrow',
                            label: 'Clink Donation Flow',
                        },
                    ],
                    shortcuts: [], // Empty shortcuts to prevent icon references
                },
                devOptions: {
                    enabled: true,
                    type: 'module',
                    navigateFallbackAllowlist: [/^\/$/],
                },
            }),
            visualizer({
                filename: 'dist/stats.html',
                open: false,
                gzipSize: true,
                brotliSize: true,
            }),
        ],
    };
});
