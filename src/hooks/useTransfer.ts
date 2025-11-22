import {
    createTransferMessage,
    RPCMethod,
    type RPCTransferAllocation,
    type TransferRequestParams,
} from '@erc7824/nitrolite';
import { useCallback, useState } from 'preact/hooks';
import { getAddress, isAddress } from 'viem';
import { useYellowWebSocketContext } from '../components/yellow';
import { config } from '../utils/env';
import { isValidUserTag } from '../utils/walletValidation';

/**
 * Hook for creating transfer messages using the global sessionSigner.
 */
export function useTransfer() {
    const { sessionSigner, sendWithResponse, isAuthenticated } = useYellowWebSocketContext();
    const [isTransferInProgress, setIsTransferInProgress] = useState(false);

    const handleTransfer = useCallback(
        async (recipient: string, amount: string) => {
            if (isTransferInProgress) {
                console.log('Transfer already in progress, ignoring duplicate call');
                return { success: false, error: 'Transfer already in progress' };
            }

            if (!sessionSigner) {
                console.error('Session signer not available');
                return { success: false, error: 'Session signer not available' };
            }

            if (!isAuthenticated) {
                console.error('Not authenticated with Yellow');
                return { success: false, error: 'Not authenticated with Yellow' };
            }

            if (!recipient || !amount) {
                console.error('Recipient and amount are required');
                return { success: false, error: 'Recipient and amount are required' };
            }

            // Check if recipient is a user tag or address
            const isUserTag = isValidUserTag(recipient);
            const isEthAddress = isAddress(recipient);

            if (!isUserTag && !isEthAddress) {
                console.error('Invalid recipient format - must be valid address or user tag');
                return { success: false, error: 'Invalid recipient format - must be valid address or user tag' };
            }

            setIsTransferInProgress(true);
            try {
                const allocations: RPCTransferAllocation[] = [
                    {
                        asset: config.asset,
                        amount,
                    },
                ];
                const params: TransferRequestParams = {
                    allocations,
                };

                if (isUserTag) {
                    // For user tags, set destination_user_tag
                    params.destination_user_tag = recipient.toUpperCase();
                    console.log('Creating transfer message with user tag:', recipient.toUpperCase());
                } else {
                    // For addresses, normalize and set destination
                    const normalizedRecipient = getAddress(recipient);
                    params.destination = normalizedRecipient;
                    console.log('Creating transfer message with normalized address:', normalizedRecipient);
                }

                // Send through Yellow WebSocket and wait for response
                const signedMessage = await createTransferMessage(sessionSigner, params);

                try {
                    const { requestInfo, response } = await sendWithResponse(signedMessage, { timeout: 30000 });

                    // Check if the response indicates success
                    if (response.method === RPCMethod.Transfer) {
                        return {
                            success: true,
                            message: 'Transfer completed successfully',
                            requestInfo,
                            response,
                        };
                    } else if (response.method === RPCMethod.Error) {
                        return {
                            success: false,
                            error: response.params[0]?.error || 'Transfer failed',
                            requestInfo,
                            response,
                        };
                    } else {
                        return {
                            success: false,
                            error: 'Unexpected response from server',
                            requestInfo,
                            response,
                        };
                    }
                } catch (responseError) {
                    return {
                        success: false,
                        error: responseError instanceof Error ? responseError.message : 'Transfer response failed',
                    };
                }
            } catch (error) {
                console.error('Error creating transfer message:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error during transfer message creation',
                };
            } finally {
                setIsTransferInProgress(false);
            }
        },
        [sessionSigner, sendWithResponse, isAuthenticated, isTransferInProgress],
    );

    return {
        handleTransfer,
    };
}
