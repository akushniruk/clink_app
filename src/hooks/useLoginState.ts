import { useCurrentUser, useEvmAddress, useIsInitialized, useSignOut } from '@coinbase/cdp-hooks';
import { useEffect, useState } from 'preact/hooks';

export function useLoginState() {
    const { isInitialized } = useIsInitialized();
    const { currentUser } = useCurrentUser();
    const { evmAddress } = useEvmAddress();
    const { signOut } = useSignOut();
    const [isReady, setIsReady] = useState(false);
    const [isWalletReady, setIsWalletReady] = useState(false);

    useEffect(() => {
        if (isInitialized) {
            setIsReady(true);
        }
    }, [isInitialized]);

    // Track when wallet is ready
    useEffect(() => {
        if (currentUser && evmAddress) {
            setIsWalletReady(true);
        } else {
            setIsWalletReady(false);
        }
    }, [currentUser, evmAddress]);

    const walletAddress = evmAddress || null;
    const authenticated = !!currentUser;

    return {
        isLoggedIn: authenticated,
        walletAddress,
        login: () => {
            // Login is handled by LoginPage components
            console.warn('Login function not directly available - use LoginPage components');
        },
        logout: signOut,
        isReady,
        user: currentUser,
        isWalletReady,
    };
}
