import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom, type WalletClient } from 'viem';
import { mainnet } from 'viem/chains';

interface WalletClientContextType {
    walletClient: WalletClient | null;
    isLoading: boolean;
    error: string | null;
}

const WalletClientContext = createContext<WalletClientContextType | null>(null);

interface WalletClientProviderProps {
    children: ComponentChildren;
}

export const WalletClientProvider = ({ children }: WalletClientProviderProps) => {
    const { authenticated, ready } = usePrivy();
    const { wallets } = useWallets();
    const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const createClient = async () => {
            const embeddedPrivyWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

            if (!authenticated || !ready || !embeddedPrivyWallet) {
                setWalletClient(null);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Switch to mainnet chain
                await embeddedPrivyWallet.switchChain(mainnet.id);

                // Get the EIP1193 provider from the embedded wallet
                const eip1193provider = await embeddedPrivyWallet.getEthereumProvider();

                // Create Viem WalletClient from Privy embedded wallet
                const client = createWalletClient({
                    account: embeddedPrivyWallet.address as any,
                    chain: mainnet,
                    transport: custom(eip1193provider),
                });

                setWalletClient(client);
                // WalletClient created successfully
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to create wallet client';
                setError(errorMessage);
                setWalletClient(null);
                // Failed to create wallet client
            } finally {
                setIsLoading(false);
            }
        };

        createClient();
    }, [authenticated, ready, wallets]);

    // Reset state when wallet disconnects
    useEffect(() => {
        if (!authenticated) {
            setWalletClient(null);
            setError(null);
            setIsLoading(false);
        }
    }, [authenticated]);

    const contextValue: WalletClientContextType = {
        walletClient,
        isLoading,
        error,
    };

    return <WalletClientContext.Provider value={contextValue}>{children}</WalletClientContext.Provider>;
};

// Hook to use WalletClient context
export const useWalletClient = (): WalletClientContextType => {
    const context = useContext(WalletClientContext);
    if (!context) {
        throw new Error('useWalletClient must be used within WalletClientProvider');
    }
    return context;
};

// Convenience hook to get just the wallet client
export const useViemWalletClient = (): WalletClient | null => {
    const { walletClient } = useWalletClient();
    return walletClient;
};
