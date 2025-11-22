import { useCallback } from 'react';
import { NitroliteRPC, RPCMethod } from '@erc7824/nitrolite';
import AssetsStore from '../store/AssetsStore';
import { useYellowWebSocketContext } from '../components/yellow';
import { useLoginState } from './useLoginState';

/**
 * Hook for fetching ledger balances using the global sessionSigner.
 */
export function useGetLedgerBalances() {
    const { sessionSigner, send, isAuthenticated } = useYellowWebSocketContext();
    const { walletAddress } = useLoginState();

    const getLedgerBalances = useCallback(async () => {
        if (!sessionSigner) {
            console.error('Session signer not available.');
            AssetsStore.setLedgerBalancesLoading(false);
            return;
        }

        if (!isAuthenticated) {
            console.error('Not authenticated with Yellow.');
            AssetsStore.setLedgerBalancesLoading(false);
            return;
        }

        if (!walletAddress) {
            console.error('Wallet address not available.');
            AssetsStore.setLedgerBalancesLoading(false);
            return;
        }

        AssetsStore.setLedgerBalancesLoading(true);

        try {
            // Generate timestamp for the request
            const timestamp = Date.now();
            const requestId = Math.floor(Math.random() * 1000000);

            // Create the request for getting ledger balances
            const request = NitroliteRPC.createRequest(
                requestId,
                // @ts-ignore
                RPCMethod.GetLedgerBalances,
                [{ account_id: walletAddress }],
                timestamp,
            );
            const signedRequest = await NitroliteRPC.signRequestMessage(request, sessionSigner);

            // Send the request through Yellow WebSocket
            send(signedRequest);

            console.log('Ledger balances request sent via WebSocket');
            // Note: Response will be handled by the WebSocket message handlers
            // and will update the AssetsStore accordingly

            return true; // Indicate request was sent successfully
        } catch (error) {
            console.error('Error getting ledger balances:', error);
            AssetsStore.setLedgerBalancesLoading(false);
            return false;
        }
    }, [sessionSigner, walletAddress, send, isAuthenticated]);

    return {
        getLedgerBalances,
    };
}
