# PWA Installation Feature

This directory contains components and hooks for implementing "Add to Home Screen" functionality for Progressive Web Applications (PWAs). The implementation handles both Android and iOS devices, with special consideration for iOS Safari which requires a manual installation process.

## Features

- **Cross-platform detection**: Identifies the device and browser environment
- **Intelligent banner display**: Shows the install banner after user engagement
- **iOS-specific guidance**: Provides a step-by-step tutorial for iOS users
- **User preference persistence**: Remembers when users dismiss the banner
- **Standalone detection**: Avoids showing the banner if the app is already installed

## Components

### InstallBanner

A responsive banner that appears at the bottom of the screen, encouraging users to install the PWA:

- Shows appropriate UI for Android/Chrome vs iOS Safari
- Provides tutorial for iOS installation with visual steps
- Allows users to dismiss the banner (saved in localStorage)
- Appears only after the user has engaged with the site
- Styled with Tailwind CSS for a modern, responsive design

```tsx
// Example usage
<InstallBanner
    delayBeforeShow={5000} // Wait 5 seconds before showing
    engagementDelay={10000} // Wait for 10 seconds of engagement
    title="Install Our App" // Custom title
    description="Install this app for a better experience" // Custom description
/>
```

## Hooks

### useInstallPwa

A custom React hook that manages PWA installation logic:

- Detects if the app is installable
- Checks if it's already installed
- Identifies iOS Safari and other browsers
- Handles the `beforeinstallprompt` event for Chrome/Android
- Provides methods to trigger installation or show instructions
- Manages localStorage preferences

```tsx
// Example usage
const {
    isIOS, // Is this an iOS device
    isStandalone, // Is the app already installed
    canPromptInstall, // Can we show the install prompt
    shouldShowIOSBanner, // Should we show iOS instructions
    promptInstall, // Function to trigger install prompt
    toggleIOSInstructions, // Function to show/hide iOS tutorial
    dismissInstallBanner, // Function to dismiss the banner
} = useInstallPwa();
```

## Edge Cases Handled

- **Already installed**: Detection for standalone mode across browsers
- **Previously dismissed**: Uses localStorage to remember user preferences
- **macOS vs iOS Safari**: Different detection for desktop vs mobile Safari
- **Different iOS versions**: Consistent instructions that work across versions
- **In-app browsers**: Detection for when the app is opened in social media browsers

## Integration

The `InstallBanner` component is already integrated into the main application layout via `ClientProviders.tsx`. It will automatically appear for users on compatible devices after they've engaged with the application for a few seconds.

## Customization

You can customize the appearance and behavior of the banner by modifying the component props:

- `delayBeforeShow`: Time to wait before showing the banner (milliseconds)
- `engagementDelay`: Time to wait for user engagement (milliseconds)
- `title`: Custom banner title
- `description`: Custom banner description
- `className`: Additional CSS classes for styling

For deeper customization, you can modify the component files directly.
