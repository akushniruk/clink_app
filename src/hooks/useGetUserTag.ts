import { useCallback } from 'preact/hooks';
import { NitroliteRPC, RPCMethod } from '@erc7824/nitrolite';
import { useYellowWebSocketContext } from '../components/yellow';
import { useLoginState } from './useLoginState';
import UserTagStore from '../store/UserTagStore';

/**
 * Hook for fetching user tag using the global sessionSigner.
 */
export function useGetUserTag() {
    const { sessionSigner, send, isAuthenticated } = useYellowWebSocketContext();
    const { walletAddress } = useLoginState();

    const getUserTag = useCallback(async () => {
        if (!sessionSigner) {
            console.error('Session signer not available.');
            UserTagStore.setLoading(false);
            UserTagStore.setError('Session signer not available');
            return;
        }

        if (!isAuthenticated) {
            console.error('Not authenticated with Yellow.');
            UserTagStore.setLoading(false);
            UserTagStore.setError('Not authenticated with Yellow');
            return;
        }

        if (!walletAddress) {
            console.error('Wallet address not available.');
            UserTagStore.setLoading(false);
            UserTagStore.setError('Wallet address not available');
            return;
        }

        UserTagStore.setLoading(true);
        UserTagStore.setError(null);

        try {
            // Generate timestamp for the request
            const timestamp = Date.now();
            const requestId = Math.floor(Math.random() * 1000000);

            console.log('get user tag RPC', RPCMethod.GetUserTag)
            // Create the request for getting user tag
            const request = NitroliteRPC.createRequest({
                requestId: requestId,
                method: RPCMethod.GetUserTag,
                params: [],
                timestamp,
            });
            console.log('request', request)
            const signedRequest = await NitroliteRPC.signRequestMessage(request, sessionSigner);

            // Send the request through Yellow WebSocket
            send(signedRequest);

            console.log('User tag request sent via WebSocket');
            // Note: Response will be handled by the WebSocket message handlers
            // and will update the UserTagStore accordingly

            return true; // Indicate request was sent successfully
        } catch (error) {
            console.error('Error getting user tag:', error);
            UserTagStore.setLoading(false);
            UserTagStore.setError(error instanceof Error ? error.message : 'Failed to get user tag');
            return false;
        }
    }, [sessionSigner, walletAddress, send, isAuthenticated]);

    return {
        getUserTag,
    };
}
