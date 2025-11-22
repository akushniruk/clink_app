export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

export const config = {
    isDev: isDevelopment,
    isProd: isProduction,
    allowDesktopInDev: import.meta.env.VITE_ALLOW_DESKTOP_DEV === 'true' || isDevelopment,
    apiUrl: import.meta.env.VITE_API_URL || '',
    asset: import.meta.env.VITE_ASSET || 'usdc',
    analytics: {
        enabled: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
        measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
    },
    features: {
        analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
        debug: import.meta.env.VITE_FEATURE_DEBUG === 'true' || isDevelopment,
    },
} as const;
