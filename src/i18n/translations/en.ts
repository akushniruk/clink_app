import type { TranslationKey } from '../types';

export const en: TranslationKey = {
    // App General
    appName: 'Clink',
    loading: 'Just a moment...',
    skip: 'Skip',
    tapToContinue: 'Tap to continue',

    // Onboarding Stories
    onboarding: {
        welcome: {
            title: 'Welcome to Clink',
            subtitle: 'Enjoy a Free Drink',
            description: 'Join us for a complimentary drink—your first sip of the Clink experience.',
        },
        topUp: {
            title: 'Top Up in Seconds',
            subtitle: 'At the Cashier',
            description: 'Visit any cashier to add funds—fast, secure, and ready when you are.',
        },
        getDrink: {
            title: 'Order & Enjoy',
            subtitle: 'Pick Up at the Bar',
            description: 'Order at the bar and enjoy your favorite drinks—quick service, great taste.',
        },
        progress: 'Step {current} of {total}',
    },

    // Home Page
    home: {
        title: 'Clink',
        subtitle: 'Your Drink‑Ordering App',
        buttons: {
            orderDrinks: 'Order Drinks',
            topUpBalance: 'Add Funds',
            myAccount: 'My Account',
        },
    },

    // Mobile Guard
    mobileOnly: {
        title: 'Made for Mobile',
        description: 'Clink is designed for phones and tablets so you get the best experience.',
        instruction: 'Please switch to your phone or tablet',
    },

    // PWA Installation
    pwa: {
        install: {
            title: 'Install Clink',
            description: 'for the best experience',
            button: 'Install',
            dismiss: 'Not now',
            howTo: 'How to install',
        },
        ios: {
            title: 'Install Clink',
            step1: {
                title: 'Tap the Share button',
                description: 'In Safari, tap the Share button in the bottom bar',
            },
            step2: {
                title: 'Find "Add to Home Screen"',
                description: 'Scroll down and choose "Add to Home Screen."',
            },
            step3: {
                title: 'Confirm installation',
                description: 'Tap "Add" in the top‑right corner to finish',
            },
        },
        status: {
            installing: 'Installing...',
            installed: 'Clink is ready!',
            failed: 'Installation failed—please try again.',
            unsupported: 'This browser doesn’t support installation.',
        },
    },

    // Payment Flow
    payment: {
        balance: 'Your Balance',
        available: 'Available:',
        amountExceeds: 'That amount is more than your balance.',
        payAmount: 'Pay',
        slideToPay: 'Slide right to pay',
        to: 'To:',
        success: 'Payment Sent!',
        receiver: 'Receiver',
        sender: 'Sender',
        date: 'Date',
        transactionFailed: 'Transaction Failed',
        scanFailed: 'Couldn’t scan the QR code—try again.',
        error: {
            default: 'Transaction failed',
            insufficient: 'Insufficient balance',
            timeout: 'Transaction timeout',
            tag: 'User tag not found',
            unknown: 'Unexpected error',
        },
        qr: {
            invalidAddress: 'Invalid address',
            invalidAddressDescription: 'Please scan a valid EVM wallet address.',
            ownAddress: 'You can’t pay yourself',
            ownAddressDescription: 'You can’t send money to your own address.',
            ownUserTag: "You can't pay yourself",
            ownUserTagDescription: "You can't send money to your own tag.",
            invalidUserTag: 'Invalid user tag',
            invalidUserTagDescription: 'Please scan a valid user tag.',
            invalidQrCode: 'Invalid QR Code',
            invalidQrCodeDescription: 'Scan a valid wallet QR code or user tag.',
            scanInstruction: 'Place the QR code inside the frame.',
            loadingUserInfo: 'Fetching user info...',
            manualEntry: 'Enter Manually',
            backToScan: 'Scan QR Code',
        },
        manual: {
            title: 'Enter User Tag',
            subtitle: 'Recipient’s user tag',
            inputLabel: 'User Tag',
            inputPlaceholder: 'User tag',
            pasteButton: 'Paste',
            pasting: 'Pasting...',
            continueButton: 'Continue',
            formatHint: 'Supported formats',
            formatDescription: 'Enter a user tag to pay',
            userTagBanner: {
                title: 'User tag',
                description:
                    'You can find the user tag on the account page by clicking on the account icon on the home page',
            },
            validation: {
                invalid: 'Invalid tag format.',
                valid: 'Looks good!',
                selfPayment: 'You can’t pay yourself.',
                selfPaymentTag: 'You can’t pay your own tag.',
                loading: 'Fetching user info...',
                clipboardError: 'Can’t access clipboard—paste manually.',
            },
        },
    },

    // History & Balance
    history: {
        title: 'History',
        balance: 'Balance',
        loading: 'Loading history...',
        error: 'Could not load history.',
        empty: 'No history yet',
        emptyDescription: 'Your payments will show up here.',
        receivedFrom: 'From:',
        sentTo: 'To:',
        transactionDetails: 'Details',
        date: 'Date',
        time: 'Time',
        pay: 'Pay',
    },

    // Transactions
    transactions: {
        title: 'Transactions',
        loading: 'Loading transactions...',
        error: 'Couldn’t load transactions.',
        empty: 'No transactions yet',
        emptyDescription: 'Your transaction history will appear here',
        receivedFrom: 'From:',
        sentTo: 'To:',
    },

    // Camera/QR Scanner
    camera: {
        initializing: 'Starting camera',
        initializingDescription: 'Please wait while we access your camera...',
        scanTitle: 'Scan QR Code',
        scanSubtitle: 'to Pay',
        errors: {
            secureRequired: 'Secure connection required',
            secureDescription: 'Camera access needs HTTPS. Please use a secure connection.',
            notSupported: 'Camera not supported',
            notSupportedDescription: 'Your device or browser doesn’t support camera access.',
            permissionDenied: 'Camera permission denied',
            permissionDescription: 'Allow camera access in your browser settings, then refresh.',
            inUse: 'Camera in use',
            inUseDescription: 'Another app is using the camera. Close it and try again.',
            notFound: 'No camera found',
            accessFailed: 'Camera access failed. Please try again.',
            noDevice: 'No camera detected on this device.',
        },
    },

    // Account & Authentication
    account: {
        title: 'Account',
        id: 'ID',
        userTag: 'User Tag',
        noAddress: 'No address',
        userTagLoading: 'Loading...',
        userTagCopied: 'Tag copied!',
        logout: 'Log out',
        almostThere: 'Almost There',
        oneStep: 'One quick step to unlock your experience',
        topUpInstruction: 'To top up, please go to the cashier.',
        copied: 'Copied!',
        shared: 'Shared',
        share: {
            addressTitle: 'Pay me on Clink',
            addressText: 'Pay me on Clink!\n\nAccount ID: {address}\n\nPay here: {url}',
            tagTitle: 'Pay me on Clink',
            tagText: 'Pay me easily on Clink!\nUser Tag: {tag}\n\nPay here: {url}',
        },
    },

    // Web3 & Errors
    web3: {
        authFailed: 'Authentication failed:',
        timeout: 'Web3 modules took too long to load',
        unavailable: 'Web3 modules are unavailable',
    },

    // UI Components
    ui: {
        pay: 'Pay',
        payByTag: 'Enter manually',
        continue: 'Continue',
        numpad: 'Keypad',
        backspace: 'Backspace',
    },

    // Language Switcher
    language: {
        current: 'Language',
        switch: 'Switch Language',
        english: 'English',
        ukrainian: 'Ukrainian',
        french: 'French',
    },

    // Login Page
    login: {
        title: 'Create Your Account',
        subtitle: 'Get started with your secure account',
        info: 'Your account is private and secure—no personal details needed.',
        methods: {
            email: 'Continue with Email',
            google: 'Continue with Google',
        },
        email: {
            placeholder: 'your@email.com',
            submit: 'Submit',
            sending: 'Sending...',
            backToOptions: '← Back to options',
        },
        otp: {
            title: 'Enter confirmation code',
            description: 'Check {email} for our email and enter your code below.',
            pasteHint: 'Tip: Paste the full code with Ctrl+V',
            didntReceive: "Didn't get an email?",
            resendCode: 'Resend code',
            resending: 'Sending...',
            backToEmail: '← Back to email',
        },
    },

    // User Profile & QR Code
    user: {
        profile: 'My Profile',
        accountId: 'Account ID',
        qrCode: {
            title: 'Your Account Code',
            description: 'Show this code to share your account or receive payments',
        },
    },

    // Yellow WebSocket Status
    yellow: {
        status: {
            connected: 'Connected',
            connecting: 'Connecting...',
            disconnected: 'Disconnected',
            error: 'Connection Error',
        },
        session: 'Session',
        retrying: 'Reconnecting...',
    },

    // Authentication Challenge
    auth: {
        challenge: {
            title: 'Almost There',
            description: 'One quick step to unlock your experience',
            cancel: 'Not Now',
            approve: 'Get Started',
            processing: 'Just a moment...',
        },
    },

    // Transfer & Shared Links
    transfer: {
        sharedLink: {
            title: 'Someone wants to receive a payment',
            description: 'Setting up your payment...',
            preparing: 'Preparing payment...',
            unauthorized: 'Please log in to send payment',
            loginRequired: 'Authentication required to proceed',
        },
    },

    // Common UI
    common: {
        close: 'Close',
        confirm: 'Confirm',
        cancel: 'Cancel',
        yes: 'Yes',
        no: 'No',
        next: 'Next',
        previous: 'Previous',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        done: 'Done',
        retry: 'Try Again',
    },

    notifications: {
        transfer: {
            sent: 'Sent {amount} {asset} to {receiver}',
            received: 'Received {amount} {asset} from {sender}',
        },
    },
};
