import { chains } from '../../config/chains';
import { PrivyProvider } from '@privy-io/react-auth';
import type { ComponentChildren } from 'preact';

interface ClientProvidersProps {
    children: ComponentChildren;
}

const ClientProviders = ({ children }: ClientProvidersProps) => {
    return (
        <PrivyProvider
            appId={import.meta.env.VITE_PRIVY_APP_ID ?? ''}
            config={{
                captchaEnabled: true,
                loginMethods: ['email', 'google'], // Standard login methods
                appearance: {
                    theme: 'dark',
                    logo: '/logo.png',
                    showWalletLoginFirst: false,
                    walletList: [], // Hide wallet options
                },
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets', // Manual wallet creation control
                    showWalletUIs: false, // Hide wallet UI since we handle it manually
                },
                legal: {
                    termsAndConditionsUrl: 'https://clink.app/terms',
                    privacyPolicyUrl: 'https://clink.app/privacy',
                },
                supportedChains: chains,
            }}
        >
            {children}
        </PrivyProvider>
    );
};

export default ClientProviders;
