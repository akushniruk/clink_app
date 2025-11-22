export type SupportedLanguage = 'en' | 'ua' | 'fr';

export interface TranslationKey {
    // App General
    appName: string;
    loading: string;
    skip: string;
    tapToContinue: string;

    // Onboarding Stories
    onboarding: {
        welcome: {
            title: string;
            subtitle: string;
            description: string;
        };
        topUp: {
            title: string;
            subtitle: string;
            description: string;
        };
        getDrink: {
            title: string;
            subtitle: string;
            description: string;
        };
        progress: string; // "{current} of {total}"
    };

    // Home Page
    home: {
        title: string;
        subtitle: string;
        buttons: {
            orderDrinks: string;
            topUpBalance: string;
            myAccount: string;
        };
    };

    // Mobile Guard
    mobileOnly: {
        title: string;
        description: string;
        instruction: string;
    };

    // Language Switcher
    language: {
        current: string;
        switch: string;
        english: string;
        ukrainian: string;
        french: string;
    };

    // Login Page
    login: {
        title: string;
        subtitle: string;
        info: string;
        methods: {
            email: string;
            google: string;
        };
        email: {
            placeholder: string;
            submit: string;
            sending: string;
            backToOptions: string;
        };
        otp: {
            title: string;
            description: string;
            pasteHint: string;
            didntReceive: string;
            resendCode: string;
            resending: string;
            backToEmail: string;
        };
    };

    // User Profile & QR Code
    user: {
        profile: string;
        accountId: string;
        qrCode: {
            title: string;
            description: string;
        };
    };

    // Yellow WebSocket Status
    yellow: {
        status: {
            connected: string;
            connecting: string;
            disconnected: string;
            error: string;
        };
        session: string;
        retrying: string;
    };

    // Authentication Challenge
    auth: {
        challenge: {
            title: string;
            description: string;
            cancel: string;
            approve: string;
            processing: string;
        };
    };

    // PWA Installation
    pwa: {
        install: {
            title: string;
            description: string;
            button: string;
            dismiss: string;
            howTo: string;
        };
        ios: {
            title: string;
            step1: {
                title: string;
                description: string;
            };
            step2: {
                title: string;
                description: string;
            };
            step3: {
                title: string;
                description: string;
            };
        };
        status: {
            installing: string;
            installed: string;
            failed: string;
            unsupported: string;
        };
    };

    // Payment Flow
    payment: {
        balance: string;
        available: string;
        amountExceeds: string;
        payAmount: string;
        slideToPay: string;
        to: string;
        success: string;
        receiver: string;
        sender: string;
        date: string;
        transactionFailed: string;
        scanFailed: string;
        error: {
            default: string;
            insufficient: string;
            timeout: string;
            tag: string;
            unknown: string;
        };
        qr: {
            invalidAddress: string;
            invalidAddressDescription: string;
            ownAddress: string;
            ownAddressDescription: string;
            ownUserTag: string;
            ownUserTagDescription: string;
            invalidUserTag: string;
            invalidUserTagDescription: string;
            invalidQrCode: string;
            invalidQrCodeDescription: string;
            scanInstruction: string;
            loadingUserInfo: string;
            manualEntry: string;
            backToScan: string;
        };
        manual: {
            title: string;
            subtitle: string;
            inputLabel: string;
            inputPlaceholder: string;
            pasteButton: string;
            pasting: string;
            continueButton: string;
            formatHint: string;
            formatDescription: string;
            userTagBanner: {
                title: string;
                description: string;
            };
            validation: {
                invalid: string;
                valid: string;
                selfPayment: string;
                selfPaymentTag: string;
                loading: string;
                clipboardError: string;
            };
        };
    };

    // History & Balance
    history: {
        title: string;
        balance: string;
        loading: string;
        error: string;
        empty: string;
        emptyDescription: string;
        receivedFrom: string;
        sentTo: string;
        transactionDetails: string;
        date: string;
        time: string;
        pay: string;
    };

    // Transactions
    transactions: {
        title: string;
        loading: string;
        error: string;
        empty: string;
        emptyDescription: string;
        receivedFrom: string;
        sentTo: string;
    };

    // Camera/QR Scanner
    camera: {
        initializing: string;
        initializingDescription: string;
        scanTitle: string;
        scanSubtitle: string;
        errors: {
            secureRequired: string;
            secureDescription: string;
            notSupported: string;
            notSupportedDescription: string;
            permissionDenied: string;
            permissionDescription: string;
            inUse: string;
            inUseDescription: string;
            notFound: string;
            accessFailed: string;
            noDevice: string;
        };
    };

    // Account & Authentication
    account: {
        title: string;
        id: string;
        userTag: string;
        noAddress: string;
        userTagLoading: string;
        userTagCopied: string;
        logout: string;
        almostThere: string;
        oneStep: string;
        topUpInstruction: string;
        copied: string;
        shared: string;
        share: {
            addressTitle: string;
            addressText: string;
            tagTitle: string;
            tagText: string;
        };
    };

    // Web3 & Errors
    web3: {
        authFailed: string;
        timeout: string;
        unavailable: string;
    };

    // UI Components
    ui: {
        pay: string;
        payByTag: string;
        continue: string;
        numpad: string;
        backspace: string;
    };

    // Transfer & Shared Links
    transfer: {
        sharedLink: {
            title: string;
            description: string;
            preparing: string;
            unauthorized: string;
            loginRequired: string;
        };
    };

    // Common UI
    common: {
        close: string;
        confirm: string;
        cancel: string;
        yes: string;
        no: string;
        next: string;
        previous: string;
        save: string;
        delete: string;
        edit: string;
        done: string;
        retry: string;
    };

    notifications: {
        transfer: {
            sent: string;
            received: string;
        };
    };
}

export interface LanguageInfo {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    flag: string;
    direction: 'ltr' | 'rtl';
}

export interface TranslationContextType {
    currentLanguage: SupportedLanguage;
    translations: TranslationKey;
    setLanguage: (language: SupportedLanguage) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    availableLanguages: LanguageInfo[];
    isLoading: boolean;
}
