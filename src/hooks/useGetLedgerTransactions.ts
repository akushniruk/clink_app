import { useCallback } from 'react';
import { createGetLedgerTransactionsMessage, RPCTxType } from '@erc7824/nitrolite';
import LedgerHistoryStore from '../store/LedgerHistoryStore.ts';
import { useYellowWebSocketContext } from '../components/yellow';
import { useLoginState } from './useLoginState';

/**
 * Hook for fetching ledger transactions using the global sessionSigner.
 */
export function useGetLedgerTransactions() {
    const { sessionSigner, send, isAuthenticated } = useYellowWebSocketContext();
    const { walletAddress } = useLoginState();

    const getLedgerTransactions = useCallback(
        async (offset?: number, limit?: number) => {
            if (!sessionSigner) {
                console.error('Session signer not available.');
                LedgerHistoryStore.setLoading(false);
                return;
            }

            if (!isAuthenticated) {
                console.error('Not authenticated with Yellow.');
                LedgerHistoryStore.setLoading(false);
                return;
            }

            if (!walletAddress) {
                console.error('Wallet address not available.');
                LedgerHistoryStore.setLoading(false);
                return;
            }

            LedgerHistoryStore.setLoading(true);

            try {
                const msg = await createGetLedgerTransactionsMessage(sessionSigner, walletAddress, {
                    tx_type: RPCTxType.Transfer,
                    sort: 'desc',
                    offset,
                    limit,
                });

                // Send the request through Yellow WebSocket
                send(msg);

                console.log('Ledger transactions request sent via WebSocket');
                // Note: Response will be handled by the WebSocket message handlers
                // and will update the LedgerTransactionsStore accordingly

                return true; // Indicate request was sent successfully
            } catch (error) {
                console.error('Error getting ledger transactions:', error);
                LedgerHistoryStore.setLoading(false);
                return false;
            }
        },
        [sessionSigner, walletAddress, send, isAuthenticated],
    );

    return {
        getLedgerTransactions,
    };
}
