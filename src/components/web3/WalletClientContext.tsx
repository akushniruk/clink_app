import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useEvmAddress, useSignEvmTypedData } from '@coinbase/cdp-hooks';

interface WalletClientContextType {
    signTypedData: ((args: {
        domain: any;
        types: any;
        primaryType: string;
        message: any;
    }) => Promise<string>) | null;
    evmAddress: string | null;
    isLoading: boolean;
    error: string | null;
}

const WalletClientContext = createContext<WalletClientContextType | null>(null);

interface WalletClientProviderProps {
    children: ComponentChildren;
}

export const WalletClientProvider = ({ children }: WalletClientProviderProps) => {
    const { evmAddress } = useEvmAddress();
    const { signEvmTypedData } = useSignEvmTypedData();

    const isLoading = false; // CDP handles loading internally
    const error = null; // CDP handles errors internally

    // Create a signing function compatible with Yellow WebSocket client
    const signTypedData = evmAddress
        ? async (args: { domain: any; types: any; primaryType: string; message: any }) => {
              const result = await signEvmTypedData({
                  evmAccount: evmAddress,
                  typedData: {
                      domain: args.domain,
                      types: args.types,
                      primaryType: args.primaryType,
                      message: args.message,
                  },
              });
              return result.signature;
          }
        : null;

    const contextValue: WalletClientContextType = {
        signTypedData,
        evmAddress: evmAddress || null,
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

// Backwards compatibility - returns the signing function
export const useViemWalletClient = (): WalletClientContextType => {
    return useWalletClient();
};
