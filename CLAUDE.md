# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack & Architecture

This is a Preact + Vite + TailwindCSS application written in TypeScript.

- **Frontend Framework**: Preact (React-like library)
- **Build Tool**: Vite with HMR (Hot Module Replacement)
- **Styling**: TailwindCSS v4 with Vite plugin
- **Language**: TypeScript with strict configuration
- **Entry Point**: `src/main.tsx` renders the `App` component into `#app` element

## Development Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run preview` - Preview production build locally
- `npm run prettier` - Format all code with Prettier

## Project Structure

### Core Files

- `src/main.tsx` - Application entry point
- `src/app.tsx` - Main App component
- `src/index.css` - Global styles
- `src/app.css` - Component-specific styles
- `public/` - Static assets served at root
- TypeScript configuration split across multiple files (tsconfig.json, tsconfig.app.json, tsconfig.node.json)

### Folder Structure

Follow this organized folder structure for organizing code:

- `src/components/` - Organized component library with logical grouping:
    - `src/components/ui/` - Reusable UI components (LanguageSwitcher, MobileOnlyGuard)
    - `src/components/user/` - User-related components (UserQRCode, profile components)
    - `src/components/web3/` - Web3 integration components (ClientProviders, AdvancedLazyWeb3)
    - `src/components/onboarding/` - Onboarding flow components
    - `src/components/index.ts` - Barrel exports for clean imports
- `src/config/` - Configuration files (rainbowkitConfig.ts, etc.)
- `src/widgets/` - Complex UI components that combine multiple components
- `src/hooks/` - Custom React/Preact hooks for shared logic (useLoginState, useFirstTimeUser)
- `src/pages/` - Page-level components representing different routes/screens
- `src/utils/` - Utility functions and helpers
- `src/performance/` - Performance monitoring, lazy loading, and optimization utilities
- `src/i18n/` - Internationalization system with translations and language management

## Internationalization (i18n)

### Supported Languages

**Primary Languages:**

- **English (en)** - Default language, US English
- **Ukrainian (ua)** - Українська for Ukrainian-speaking users
- **French (fr)** - Français for French-speaking markets

### Translation System Architecture

**Translation Provider (`src/i18n/TranslationContext.tsx`):**

- React Context-based translation system
- Automatic language detection from browser settings
- Persistent language preference in localStorage
- Fallback to English for missing translations
- Real-time language switching without page reload

**Translation Hook (`src/i18n/useTranslation.ts`):**

- `useTranslation()` - Full translation context access
- `useT()` - Simplified hook returning only translation function
- Type-safe translation keys with TypeScript support
- Parameter interpolation for dynamic content

**Language Detection & Persistence:**

- **Enhanced Device Language Detection** - Automatically detects and uses device language
- **Intelligent Priority System** - Device language preferred over saved preferences
- **Comprehensive Browser Support** - Handles navigator.languages and regional variants
- **Ukrainian Language Support** - Detects both 'uk' and 'ua' language codes
- **localStorage Persistence** - Saves user preferences with error handling
- **Document Language Updates** - Accessibility-compliant language attribute updates
- **Graceful Degradation** - Fallback to English on any detection errors

### Implementation Guidelines

**Translation Keys Structure:**

```typescript
// Nested object structure for organization
t('onboarding.welcome.title'); // → "Welcome to Clink" / "Ласкаво просимо до Clink" / "Bienvenue chez Clink"
t('onboarding.progress', { current: 1, total: 3 }); // → "1 of 3" / "1 з 3" / "1 sur 3"
```

**Adding New Translations:**

1. Update `src/i18n/types.ts` with new translation keys
2. Add translations to all language files (`en.ts`, `ua.ts`, `fr.ts`)
3. Use TypeScript for compile-time validation
4. Test with all supported languages

**Component Integration:**

```tsx
import { useTranslation } from '../i18n';

const MyComponent = () => {
    const { t, currentLanguage, setLanguage } = useTranslation();

    return (
        <div>
            <h1>{t('home.title')}</h1>
            <p>{t('welcome.message', { name: 'User' })}</p>
        </div>
    );
};
```

### Language Switcher

**Component (`src/components/LanguageSwitcher.tsx`):**

- Dropdown interface with native language names
- Flag emojis for visual identification
- Accessible keyboard navigation
- Real-time language switching
- Mobile-optimized interface

**Features:**

- Current language highlighting
- Click-outside-to-close functionality
- Smooth transitions and hover states
- Touch-friendly mobile design

### Performance Considerations

**Production-Grade Optimizations:**

- **Translation Caching** - In-memory cache for frequently used translations
- **Optimized Interpolation** - Cached regex patterns for parameter replacement
- **Preloading Strategy** - Common translations preloaded on language change
- **Bundle Optimization** - Static imports with TypeScript tree-shaking
- **Error Boundaries** - Comprehensive error handling with graceful degradation

**Performance Features:**

- Cached translation lookups with O(1) retrieval
- Batch translation loading for improved performance
- Memory-efficient caching with automatic cleanup
- Optimized parameter validation and interpolation
- Production error reporting and analytics integration

**Bundle Size Optimization:**

- Compact translation file structure (< 5KB per language)
- Shared common translations across languages
- TypeScript tree-shaking removes unused translations
- Optimized imports prevent unnecessary bundle bloat

### Future Extensibility

**Adding New Languages:**

1. Add language code to `SupportedLanguage` type
2. Create new translation file (e.g., `es.ts` for Spanish)
3. Add language info to `SUPPORTED_LANGUAGES` constant
4. Update `BROWSER_LANGUAGE_MAP` for detection
5. Add appropriate regional variants and language codes

**RTL Language Support:**

- Direction attribute handling in `updateDocumentLanguage()`
- CSS logical properties ready for RTL languages
- Layout components designed for bidirectional support

### Error Handling & Diagnostics

**Production-Grade Error Management:**

- **Error Reporter** - Centralized error tracking and analytics
- **Safe Operations** - Wrapped functions with fallback handling
- **Diagnostics API** - Runtime error statistics and performance metrics
- **Development Logging** - Enhanced debugging in development mode
- **Storage Resilience** - Graceful degradation on localStorage failures

**Error Types Tracked:**

- Missing translation keys
- Invalid interpolation parameters
- Language detection failures
- Storage operation errors
- Network connectivity issues

## UI Design System

### Dark Theme Implementation & Color System

**Clink Color Palette:**

```css
:root {
    /* Base Colors */
    --color-base-red: #fb8c7f;
    --color-base-green: #b6f24e;
    --color-base-violet: #9f54fc;
    --color-base-yellow: #ffbb29;

    /* CTA (Call-to-Action) Colors */
    --color-cta: #DF5201;
    --color-cta-1: color-mix(in srgb, #DF5201 50%, transparent);
    --color-cta-2: color-mix(in srgb, #DF5201 35%, transparent);
    --color-cta-3: color-mix(in srgb, #DF5201 25%, transparent);
    --color-cta-4: color-mix(in srgb, #DF5201 15%, transparent);
    --color-cta-5: color-mix(in srgb, #DF5201 8%, transparent);

    /* Shades System */
    --color-shades-100: #fdfcfc;
    --color-shades-90: #e9e2e1;
    --color-shades-80: #d5c5c3;
    --color-shades-70: #c1a6a3;
    --color-shades-60: #ac8783;
    --color-shades-50: #9a6862;
    --color-shades-40: #7b534f;
    --color-shades-30: #5e3d3a;
    --color-shades-20: #402825;
    --color-shades-10: #201312;
    --color-shades-5: #110a09;
    --color-shades-0: #000000;
}
```

**Story-Specific Color Schemes:**

1. **Welcome Story (Story 1):**

    - Background: `linear-gradient(180deg, rgba(56, 4, 4, 0.6) 0%, rgba(121, 29, 29, 0.6) 100%), #000`
    - Number/Circle: `var(--color-cta)` (#F25E4E)
    - Badge: CTA color variants

2. **Top-up Story (Story 2):**

    - Background: `linear-gradient(180deg, rgba(56, 16, 4, 0.6) 0%, rgba(87, 121, 29, 0.6) 100%), #000`
    - Number/Circle: `#B6F24E` (Base Green)
    - Badge: Green color variants

3. **Get Drink Story (Story 3):**
    - Background: `linear-gradient(180deg, rgba(56, 16, 4, 0.6) 0%, rgba(69, 13, 117, 0.6) 100%), #000`
    - Number/Circle: `#9F54FC` (Base Violet)
    - Badge: Violet color variants

**Progressive Blur Effects:**

- **Circle Glow**: `backdropFilter: 'blur(70px)'` with gradient mask `linear-gradient(to top, transparent 0%, black 100%)`
- **Number Text**: Base text + overlay with `backdropFilter: 'blur(20px)'` and gradient mask `linear-gradient(to top, black 0%, transparent 100%)`
- **Bottom Glow**: `filter: 'blur(127.98px)'` with 25% opacity

**Typography System:**

- **Primary Font**: Sora (300, 400, 500, 600, 700 weights)
- **Fallback Stack**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Large Numbers**: 30rem font size, 500 weight, -0.71px letter spacing
- **Title Text**: 22px, 700 weight, -0.2px letter spacing
- **Body Text**: 15px, 600 weight, -0.2px letter spacing
- **Badge Text**: 13px, 700 weight, 0.2px letter spacing

**Critical CSS Classes:**

```css
.bg-cta {
    background-color: var(--color-cta);
}
.bg-cta-3 {
    background-color: var(--color-cta-3);
}
.text-shades-100 {
    color: var(--color-shades-100);
}
.text-shades-80 {
    color: var(--color-shades-80);
}
```

**Performance Optimized:**

- Critical CSS inlined in HTML `<head>` (including color variables and onboarding styles)
- Consistent theme across all components and states
- No flash of unstyled content (FOUC) on initial load
- Hardware-accelerated blur effects using backdrop-filter

## User Experience & Onboarding

### First-Time User Experience

**Onboarding Stories System:**

- Instagram-style story interface for new users
- Three sequential stories: Welcome (free drink), Top-up process, Get drink process
- Auto-advancing with manual tap-to-continue option
- Progress indicators and story-specific theming

**Production-Grade Story Component (`src/components/onboarding/Story.tsx`):**

- **Performance Optimizations**:

    - Pre-computed gradient constants for zero runtime calculation
    - Memoized style calculations with `useMemo`
    - RequestAnimationFrame for smooth progress animations
    - Static style objects to prevent object recreation
    - Callback optimization with `useCallback`

- **Visual Design**:

    - Story-specific gradient backgrounds and color schemes
    - Progressive blur effects using backdrop-filter
    - Hardware-accelerated transforms and filters
    - Responsive positioning with percentage-based layouts

- **Interaction Design**:
    - Touch-optimized tap-to-advance functionality
    - Smooth progress bar animations
    - Visual feedback with glow effects
    - Mobile-first responsive design

**Story Structure:**

1. **Welcome Story**: Free drink offer, red gradient background (#F25E4E theme)
2. **Top-up Story**: Cashier payment process, green gradient background (#B6F24E theme)
3. **Get Drink Story**: Bar ordering process, violet gradient background (#9F54FC theme)

**Technical Features:**

- RequestAnimationFrame-based progress updates (60fps smooth)
- Pre-computed style constants for optimal performance
- GPU-accelerated blur effects with gradient masks
- Zero-layout-shift responsive design
- Critical CSS inlined for instant rendering
- Production-ready error boundaries and fallbacks

**First-Time User Detection (`src/hooks/useFirstTimeUser.ts`):**

- Robust localStorage-based user preference system
- Backward compatibility with legacy onboarding keys
- Version-aware onboarding system for future updates
- Error handling with graceful degradation

### Mobile-First Development

- App is designed for mobile devices only in production
- In development mode, desktop access is allowed for easier development
- Use `MobileOnlyGuard` component to wrap the app for production mobile restriction
- Environment configuration available in `src/utils/env.ts`

## Progressive Web App (PWA)

- **PWA Configuration**: Configured with `vite-plugin-pwa` in `vite.config.ts`
- **Service Worker**: Custom service worker at `src/service-worker.js` with caching strategies
- **Manifest**: PWA manifest configured inline in Vite config for "Clink" app
- **Icons**: PWA icons should be placed in `public/icons/` directory (see README for required sizes)
- **Features**:
    - Auto-update registration
    - Offline support with cache-first strategy for images
    - Font caching for Google Fonts
    - Portrait-first orientation for mobile
    - Standalone display mode

### Offline Experience

**Offline Page (`public/offline.html`):**

- **Brand Consistency**: Matches main app's dark theme and color scheme
- **Visual Design**:
    - Same gradient background as welcome story
    - CTA color accents (#F25E4E) with glow effects
    - Mobile phone emoji with pulse animation and glow
    - Sora font family for consistency
- **Interactive Elements**:
    - Glowing retry button with hover states
    - Touch-optimized for mobile devices
    - Smooth transitions and feedback
- **Performance**:
    - Self-contained with inlined CSS
    - Google Fonts preloading
    - Hardware-accelerated animations
    - Mobile-responsive design

## Environment Configuration

- **Environment Files**:

    - `.env` - Local development environment variables (not committed)
    - `.env.example` - Template for environment variables (committed)
    - All environment variables must be prefixed with `VITE_` to be accessible in the frontend

- **Available Environment Variables**:
    - `VITE_ALLOW_DESKTOP_DEV` - Allow desktop access in development
    - `VITE_API_URL` - API endpoint URL
    - `VITE_FEATURE_ANALYTICS` - Enable analytics features
    - `VITE_FEATURE_DEBUG` - Enable debug mode
    - `VITE_YELLOW_WALLET_ID` - Yellow Wallet integration ID for Web3 features

## Code Style & Formatting

- **Prettier Configuration**: `.prettierrc` with following key settings:
    - Single quotes for JS/TS, double quotes for CSS/HTML
    - Tab width: 4 spaces (HTML/CSS), 2 spaces for other files
    - Print width: 120 characters
    - JSX brackets on same line
    - Always use semicolons

## Build Size Optimization

Application is optimized for 3G/4G networks with poor connectivity. Build size must be kept minimal.

### Build Configuration

- **Target**: ES2015 for broad compatibility
- **Minification**: Terser with aggressive compression
- **Code Splitting**: Separate vendor chunks (Preact)
- **Tree Shaking**: Remove unused code automatically
- **Console Removal**: Strip console.log in production

### Bundle Analysis

- **Bundle Analyzer**: `npm run build` generates `dist/stats.html`
- **Size Limits**: 100KB chunk warning threshold
- **Compression**: Gzip and Brotli files generated

### Optimization Guidelines

- Keep total JS bundle under 50KB gzipped
- Minimize external dependencies
- Use dynamic imports for non-critical code
- Optimize images and assets
- Cache fonts efficiently (30 day expiration)

### Size Targets (Gzipped)

- HTML: < 1KB
- CSS: < 10KB
- JS: < 50KB
- Total: < 100KB initial load

### Commands

- `npm run build` - Build with size analysis
- Check `dist/stats.html` for bundle breakdown
- Monitor build output for size warnings

## Performance & Loading Strategy

Optimized for 3G/4G networks with proper resource waterfall prioritization.

### Critical Rendering Path

1. **HTML** - Inline critical CSS for instant render
2. **Critical CSS** - Above-the-fold styles inlined in `<head>`
3. **Main JS** - Preloaded with `modulepreload`
4. **Non-critical resources** - Loaded after main render

### Resource Prioritization

- **DNS Prefetch**: Google Fonts domains
- **Preconnect**: Critical third-party origins
- **Modulepreload**: Main application bundle
- **Prefetch**: Offline page and future routes

### Font Loading Strategy

- **System fonts first**: No external font downloads
- **Font-display: swap**: Prevent layout shift
- **Local fonts**: Use device system fonts when available
- **Fallback stack**: Comprehensive font fallbacks

### Lazy Loading

- **Images**: Native lazy loading + intersection observer
- **Components**: Dynamic imports with Suspense
- **Routes**: Code splitting for page-level components
- **Non-critical JS**: Loaded during idle time

### Performance Monitoring

- **Web Vitals**: LCP, FID, CLS tracking
- **Network-aware loading**: Adapt to connection quality
- **Loading states**: Smooth transitions and feedback
- **Error boundaries**: Graceful failure handling

### Best Practices Applied

- Critical CSS inlined (< 14KB)
- JavaScript loaded non-blocking
- Images optimized with lazy loading
- Service worker for offline support
- Resource hints for better performance
- Reduced motion support for accessibility

## Mobile Performance Optimizations

### Touch & Interaction Optimization

**Eliminate 300ms Tap Delay:**

- Viewport meta tag includes `user-scalable=no` for mobile optimization
- All interactive elements use `touch-action: manipulation` in critical CSS
- Applied to buttons, inputs, links, and elements with `[role="button"]`

**Critical CSS Implementation (index.html:20-117):**

```css
/* Eliminate 300ms tap delay */
*,
*::before,
*::after {
    touch-action: manipulation;
}
button,
input,
select,
textarea,
a,
[role='button'] {
    touch-action: manipulation;
}
```

### Service Worker Optimization

**Non-blocking SW Registration:**

- PWA config set to `registerType: 'prompt'` with `injectRegister: false`
- Manual registration using `requestIdleCallback` with 2s timeout fallback
- Service worker registration deferred until browser idle time

**Implementation (index.html:154-170):**

```javascript
if ('serviceWorker' in navigator) {
    const registerSW = () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(registerSW, { timeout: 2000 });
    } else {
        setTimeout(registerSW, 1000);
    }
}
```

### CSS Loading Strategy

**Critical CSS Inlined (index.html:20-117):**

- Reset styles and box-sizing
- System font definitions with `font-display: swap`
- Base typography and colors
- Loading states and animations
- Mobile responsive breakpoints
- Performance optimizations for images/video

**Non-critical CSS Loading:**

- Async CSS loader function for future stylesheets
- Preload with fallback: `<link rel="preload" href="/src/index.css" as="style">`
- Tailwind and remaining styles loaded through main.tsx import

### Resource Prioritization

**Optimized Resource Hints:**

- DNS prefetch for Google Fonts (conditional)
- Preconnect only for mobile devices: `media="(max-width: 768px)"`
- Modulepreload for main application bundle
- Prefetch for offline page and future routes

**Font Loading Strategy:**

- **Primary Font**: Sora from Google Fonts with full weight range (300-700)
- **Fallback Stack**: System fonts (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`)
- **Loading Optimization**: `font-display: swap` for better performance
- **Caching Strategy**: Long-term caching (1 year) for font assets
- **Preconnect**: Direct connection to Google Fonts for faster loading

### Performance Targets & Monitoring

**Current Performance Metrics:**

- First Contentful Paint (FCP): < 1.5s on 3G
- Largest Contentful Paint (LCP): < 2.5s on 3G
- First Input Delay (FID): < 100ms (eliminated tap delay)
- Cumulative Layout Shift (CLS): < 0.1

**Maintaining Performance During Development:**

1. **Critical CSS Management:**

    - Keep inlined CSS under 14KB
    - Only include above-the-fold styles in `<style>` block
    - Move non-critical styles to external CSS files

2. **JavaScript Loading:**

    - Use dynamic imports for non-critical components
    - Implement code splitting for routes/pages
    - Defer third-party scripts with `requestIdleCallback`

3. **Asset Optimization:**

    - Compress images and use modern formats (WebP, AVIF)
    - Implement lazy loading for all media
    - Use system fonts when possible

4. **Bundle Size Monitoring:**
    - Run `npm run build` to check bundle sizes
    - Monitor `dist/stats.html` for bundle analysis
    - Keep main JS bundle under 50KB gzipped

**Development Guidelines:**

- Always test on 3G throttling
- Verify Core Web Vitals after major changes
- Use Chrome DevTools Performance tab for optimization
- Check mobile usability with real devices when possible

## Web3 Integration & Wallet System

### Overview

This application integrates Web3 wallet functionality using a Web2-friendly approach that hides blockchain terminology from end users. The system provides Yellow Wallet integration with QR code display for user account management.

### Technology Stack

**Core Web3 Libraries:**

- **@rainbow-me/rainbowkit** - Wallet connection UI and management
- **wagmi** - React hooks for Ethereum
- **@tanstack/react-query** - Data fetching and state management
- **@privy-io/cross-app-connect** - Cross-app wallet integration
- **viem** - TypeScript interface for Ethereum
- **react-qrcode-logo** - QR code generation with custom branding

### Architecture & Performance Strategy

**Ultra-Lazy Loading Implementation:**

The Web3 integration is designed with extreme performance optimization to prevent heavy blockchain libraries from impacting the initial app load:

```typescript
// src/components/web3/AdvancedLazyWeb3.tsx
const AdvancedLazyWeb3 = ({ children }: { children: React.ReactNode }) => {
    // Implements idle-time preloading and error handling
    // Defers Web3 loading until browser is idle or user interacts
    // Provides fallback UI during loading states
};
```

**Key Performance Features:**

- **Idle-time Preloading**: Web3 modules load during browser idle time
- **Manual Chunking**: Separate bundles for crypto, web3, and vendor libraries
- **Strategic PWA Caching**: Large Web3 chunks cached on-demand, not precached
- **Error Boundaries**: Graceful degradation if Web3 fails to load

### Component Organization

**Organized folder structure for maintainability:**

```
src/components/
├── index.ts (barrel exports for clean imports)
├── onboarding/ (existing onboarding components)
├── ui/ (reusable UI components)
│   ├── LanguageSwitcher.tsx
│   └── MobileOnlyGuard.tsx
├── user/ (user-related components)
│   └── UserQRCode.tsx
└── web3/ (all Web3-related components)
    ├── AdvancedLazyWeb3.tsx
    ├── ClientProviders.tsx
    └── index.ts
```

### Web3 Configuration

**RainbowKit Configuration (`src/config/rainbowkitConfig.ts`):**

```typescript
const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                toPrivyWallet({
                    id: import.meta.env.VITE_YELLOW_WALLET_ID,
                    name: 'Yellow Wallet',
                    iconUrl: '',
                }),
                metaMaskWallet,
            ],
        },
    ],
    {
        appName: 'Yellow Apps',
        projectId: 'local-dev',
    },
);

export const config = createConfig({
    chains: [mainnet],
    transports: { [mainnet.id]: http() },
    connectors,
    ssr: true,
});
```

### User Experience Design

**Web2-Friendly Interface:**

The application deliberately hides Web3 terminology to provide a familiar experience for traditional users:

- **"Create Your Account"** instead of "Connect Wallet"
- **"Account ID"** instead of "Wallet Address"
- **"Account Code"** instead of "Public Key"
- **No blockchain-specific terminology** in user-facing text

**QR Code Implementation (`src/components/user/UserQRCode.tsx`):**

```typescript
export function UserQRCode({ userId, className = '' }: UserQRCodeProps) {
    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCode
                    value={userId}
                    size={150}
                    logoImage="data:image/svg+xml,..." // Star logo
                    logoHeight={40}
                    logoWidth={40}
                    logoPadding={4}
                    logoPaddingStyle="square"
                    qrStyle="squares"
                    removeQrCodeBehindLogo
                    quietZone={0}
                    bgColor="#000000"
                    fgColor="#ffffff"
                />
            </div>
            <p className="text-center text-gray-300 text-sm mt-3">
                {t('user.qrCode.description')} {/* Web2-friendly description */}
            </p>
        </div>
    );
}
```

### State Management

**Login State Hook (`src/hooks/useLoginState.ts`):**

```typescript
export const useLoginState = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const login = useCallback((address: string) => {
        setIsLoggedIn(true);
        setWalletAddress(address);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('walletAddress', address);
    }, []);

    // Persistent login state with localStorage
    // Automatic wallet address formatting for display
};
```

### Translation System Integration

**Web2-Friendly Translations Added:**

```typescript
// Translation keys for Web3 features
login: {
    title: 'Create Your Account',
    subtitle: 'Get started with your personal account',
    button: 'Create Account',
    connecting: 'Setting up your account...',
    error: 'Failed to create account. Please try again.',
}

user: {
    qrCode: {
        title: 'Your Account Code',
        description: 'Share this code to receive payments or connect with others',
    },
    profile: {
        accountId: 'Account ID',
        // No "wallet" terminology used
    },
}
```

### Bundle Optimization for Web3

**Critical Challenge Solved:**

Web3 libraries are extremely large (3MB+ total), which created PWA caching issues and performance problems. The solution implements:

**Optimized Manual Chunking Strategy (`vite.config.ts`):**

```typescript
build: {
    rollupOptions: {
        output: {
            manualChunks: (id) => {
                // Core Preact - essential for initial load
                if (id.includes('node_modules/preact')) {
                    return 'vendor';
                }

                // Translation files - separate for language switching
                if (id.includes('translations/en')) return 'i18n-en';
                if (id.includes('translations/ua')) return 'i18n-ua';
                if (id.includes('translations/fr')) return 'i18n-fr';

                // Web3 components - group together for reliability
                if (id.includes('src/components/web3/') ||
                    id.includes('src/config/rainbowkitConfig') ||
                    id.includes('src/hooks/useLoginState')) {
                    return 'web3-components';
                }

                // Core Web3 libraries - separate large chunk
                if (id.includes('node_modules') && (
                    id.includes('@rainbow-me') ||
                    id.includes('wagmi') ||
                    id.includes('viem') ||
                    id.includes('@privy-io')
                )) {
                    return 'web3-libs';
                }

                // QR code library - separate due to size
                if (id.includes('react-qrcode-logo')) {
                    return 'qr-code';
                }
            },
        },
    },
}
```

**PWA Caching Strategy:**

```typescript
workbox: {
    // Strategic caching - exclude large Web3 bundles from precache
    globPatterns: [
        '**/*.{css,html,ico,png,svg}',
        'js/index-*.js',
        'js/vendor-*.js',
        'js/crypto-*.js',
        'js/i18n-*.js',
        'js/*LoginButton*.js',
        'js/*Performance*.js',
    ],
    globIgnores: ['**/stats.html'],
    maximumFileSizeToCacheInBytes: 3145728, // 3MB max

    // Runtime caching for large Web3 chunks
    runtimeCaching: [
        {
            urlPattern: /\/js\/(web3|vendor-misc)-.*\.js$/,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'large-js-chunks',
                expiration: { maxEntries: 10, maxAgeSeconds: 604800 }
            }
        }
    ]
}
```

### Performance Metrics Impact

**Before Web3 Integration:**

- Total JS bundle: ~40KB gzipped
- Initial load time: <1.5s on 3G

**After Web3 Integration (Optimized):**

- Core app bundle: ~45KB gzipped (minimal increase)
- Web3 chunks: ~800KB gzipped (loaded on-demand)
- Initial load time: <1.6s on 3G (0.1s increase)
- Web3 feature load time: <2s additional (acceptable for feature)

### Implementation Flow

**User Journey:**

1. User completes onboarding
2. HomePage displays "Create Your Account" button
3. User clicks button → Web3 components load lazily
4. Wallet connection occurs with Web2-friendly interface
5. Upon success, QR code displays with user's account ID
6. Account ID shown in shortened format (first 6 + last 4 characters)

**Technical Flow:**

1. **Lazy Loading**: Web3 components load only when needed
2. **Provider Setup**: ClientProviders wraps app with necessary contexts
3. **State Management**: useLoginState hook manages authentication
4. **QR Generation**: UserQRCode component creates branded QR codes
5. **Persistence**: Login state persisted in localStorage

### Error Handling

**Production-Grade Error Management with Retry Logic:**

```typescript
// Advanced retry logic with exponential backoff
const loadModules = async (attempt = 0) => {
    try {
        await preloadWeb3Modules();
        setIsLoaded(true);
        setError(null);
    } catch (err) {
        console.error(`Web3 loading attempt ${attempt + 1} failed:`, err);

        if (attempt < 2) { // Retry up to 3 times
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
            setTimeout(() => {
                loadModules(attempt + 1);
            }, delay);
        } else {
            setError('Failed to load Web3 modules');
        }
    }
};

// Graceful error UI with manual retry
if (error) {
    return (
        <div className="text-center p-4 flex flex-col items-center gap-4">
            <div className="text-red-500">{error}</div>
            <button
                onClick={handleRetry}
                className="px-4 py-2 bg-cta text-white rounded-sm hover:bg-opacity-90 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}

// Robust promise handling with cleanup
Web3ModulesPromise = Promise.all([
    import('./ClientProviders'),
    import('./Web3LoginButton')
]).catch((error) => {
    console.error('Failed to load Web3 modules:', error);
    // Reset the promise so it can be retried
    Web3ModulesPromise = null;
    throw error;
});
```

**Key Error Handling Features:**

- **Exponential Backoff**: Retries with increasing delays (1s, 2s, 4s)
- **Automatic Retry**: Up to 3 attempts for transient network issues
- **Manual Retry**: User-friendly retry button for persistent failures
- **Promise Reset**: Failed promises are cleared to allow fresh attempts
- **Graceful Degradation**: App continues to function without Web3 features
- **Console Logging**: Detailed error tracking for debugging
- **Production Safety**: No app crashes on Web3 module failures

### Security Considerations

**Production Security:**

- Environment variables for wallet configuration
- No private keys stored in frontend
- Secure localStorage handling with error boundaries
- CSP-compatible Web3 integration
- No sensitive data in QR codes (only public account IDs)

### Future Extensibility

**Planned Enhancements:**

- Multiple wallet support (MetaMask, WalletConnect)
- Transaction history display
- Payment functionality integration
- Enhanced QR code features (payment requests)
- Web3 analytics and usage tracking

### Development Guidelines

**When Working with Web3 Components:**

1. **Always use lazy loading** for Web3 features
2. **Test performance impact** with `npm run build` and bundle analysis
3. **Maintain Web2-friendly terminology** in all user-facing text
4. **Handle loading states gracefully** with appropriate UI feedback
5. **Test on 3G networks** to ensure acceptable performance
6. **Use environment variables** for all Web3 configuration
7. **Implement proper error boundaries** for Web3 component failures

**Bundle Size Monitoring:**

- Monitor `dist/stats.html` after Web3 changes
- Ensure core app bundle stays under 50KB gzipped
- Web3 chunks should be loaded on-demand only
- Test PWA caching with Web3 chunks included

**Testing Checklist:**

- [ ] Core app loads quickly without Web3
- [ ] Web3 features load properly when accessed
- [ ] QR codes generate correctly with proper branding
- [ ] Login state persists across browser sessions
- [ ] Error states handle Web3 failures gracefully
- [ ] Translations work correctly for all Web3 features
- [ ] PWA caching works with Web3 chunks included

## Privy Integration & Web2-Friendly Architecture (Current Implementation)

### Migration from Wagmi to Privy

**IMPORTANT**: The application has been migrated from Wagmi to Privy for a more Web2-friendly user experience. This section documents the current implementation and critical patterns that must be maintained.

### Technology Stack (Current)

**Core Web3 Libraries:**

- **@privy-io/react-auth** - Primary authentication and wallet management
- **viem** - TypeScript interface for Ethereum (wallet client creation)
- **react-qrcode-logo** - QR code generation with custom branding

**Removed Dependencies:**

- ~~@rainbow-me/rainbowkit~~ - Replaced with Privy
- ~~wagmi~~ - Replaced with Privy hooks
- ~~@tanstack/react-query~~ - No longer needed with Privy

### Provider Architecture (CRITICAL)

**Provider Hierarchy (Must be maintained in this exact order):**

```typescript
// src/app.tsx
<TranslationProvider>           // 1. Internationalization
  <ClientProviders>             // 2. Privy authentication
    <WalletClientProvider>      // 3. Wallet client creation
      <YellowWebSocketProvider> // 4. Single WebSocket connection
        <AppContent />          // 5. Application content
      </YellowWebSocketProvider>
    </WalletClientProvider>
  </ClientProviders>
</TranslationProvider>
```

### Privy Configuration (ClientProviders.tsx)

**Critical Settings:**

```typescript
// src/components/web3/ClientProviders.tsx
<PrivyProvider
    appId={import.meta.env.VITE_PRIVY_APP_ID ?? ''}
    config={{
        captchaEnabled: true,
        loginMethods: ['email', 'google'], // Web2 login methods only
        appearance: {
            theme: 'dark',
            logo: '/logo.png',
            showWalletLoginFirst: false,  // Hide Web3 wallet options
            walletList: [],               // No external wallets shown
        },
        embeddedWallets: {
            createOnLogin: 'users-without-wallets', // Auto-create embedded wallets
            showWalletUIs: false,                   // Hide wallet UI - we handle manually
        },
        supportedChains: chains,
    }}>
```

**Key Configuration Principles:**

- **Web2-first**: Only email/Google login shown to users
- **Hidden Web3**: No blockchain terminology or wallet UI exposed
- **Embedded wallets**: Automatically created in background
- **No external wallets**: MetaMask, WalletConnect etc. hidden from users

### Wallet Client Creation Pattern

**Embedded Wallet Pattern (CRITICAL - Use this exact pattern):**

```typescript
// This pattern is used in both WalletClientContext.tsx and useYellowWebSocket.ts

// 1. Find embedded Privy wallet
const embeddedPrivyWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

// 2. Switch to mainnet chain
await embeddedPrivyWallet.switchChain(mainnet.id);

// 3. Get EIP1193 provider
const eip1193provider = await embeddedPrivyWallet.getEthereumProvider();

// 4. Create viem wallet client
const walletClient = createWalletClient({
    account: embeddedPrivyWallet.address as any,
    chain: mainnet,
    transport: custom(eip1193provider),
});
```

**NEVER use the old Wagmi pattern** - always use this embedded wallet approach.

### WebSocket Connection Architecture

**Single Connection Pattern (CRITICAL):**

```typescript
// YellowWebSocketProvider.tsx - ONLY place where useYellowWebSocket is called
const yellowWebSocket = useYellowWebSocket({...});

// All other components use context:
// HomePage.tsx, useTransfer.ts, etc.
const yellowWS = useYellowWebSocketContext();
```

**Anti-Pattern (Will create multiple connections):**

```typescript
// ❌ NEVER DO THIS - Creates duplicate connections
const yellowWS1 = useYellowWebSocket(); // In component 1
const yellowWS2 = useYellowWebSocket(); // In component 2
```

### Web2-Friendly User Experience

**Terminology Guidelines (CRITICAL):**

| ❌ Blockchain Terms | ✅ Web2-Friendly Terms    |
| ------------------- | ------------------------- |
| "Wallet"            | "Account"                 |
| "Wallet Address"    | "Account ID"              |
| "Creating Wallet"   | "Setting up your account" |
| "Connect Wallet"    | "Create Your Account"     |
| "Sign Transaction"  | "Confirm Action"          |
| "Gas Fee"           | "Processing Fee"          |
| "Public Key"        | "Account Code"            |

**Implementation Examples:**

```typescript
// LoginPage.tsx - Web2-friendly loading states
{isCreatingWallet ? 'Setting up your account...' : 'Signing In...'}

// Console logs - Web2-friendly
console.log('User authenticated, setting up account...');
console.log('Account setup completed successfully');

// User-facing components
<QRCode title="Your Account Code" />
<span>Account ID: {formatAddress(address)}</span>
```

### Critical Patterns & Common Pitfalls

**Login Flow (CRITICAL):**

1. **App navigation based on `isWalletReady`** - not just `isLoggedIn`
2. **Single wallet creation** - only in useEffect, never in button click
3. **Proper loading states** - prevent multiple clicks during setup

**WebSocket Connections:**

1. **Single connection only** - Use YellowWebSocketProvider
2. **Context usage** - useYellowWebSocketContext in components
3. **Auto-challenge approval** - Built into useYellowWebSocket

**Performance:**

1. **Bundle size monitoring** - Keep core under 50KB gzipped
2. **Lazy loading** - Web3 chunks loaded on-demand
3. **Provider order** - Exact hierarchy must be maintained

### Testing Requirements

**Critical Test Cases:**

- [ ] Single WebSocket connection (not 4-6)
- [ ] Web2-friendly terminology throughout
- [ ] Wallet creation without user awareness
- [ ] Proper loading states prevent multiple clicks
- [ ] App navigation waits for `isWalletReady`
- [ ] Auto-challenge approval works
- [ ] Bundle size stays within limits

This architecture ensures a seamless Web2 experience while leveraging Web3 infrastructure invisibly in the background.
