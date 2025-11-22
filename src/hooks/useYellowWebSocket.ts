import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useCurrentUser, useEvmAddress, useIsInitialized, useSignEvmTypedData } from '@coinbase/cdp-hooks';
import { createWalletClient, custom, type Address } from 'viem';
import { mainnet } from 'viem/chains';
import { createYellowWebSocketClient, type YellowWebSocketClient } from '../services/yellow/client';
import type { WSStatus, YellowConnectionCallbacks, YellowConfig } from '../services/yellow/types';

interface UseYellowWebSocketOptions extends YellowConnectionCallbacks {
    config?: Partial<YellowConfig>;
}

export const useYellowWebSocket = (options: UseYellowWebSocketOptions = {}) => {
    const { isInitialized } = useIsInitialized();
    const { currentUser } = useCurrentUser();
    const { evmAddress } = useEvmAddress();
    const { signEvmTypedData } = useSignEvmTypedData();
    const [status, setStatus] = useState<WSStatus>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const [cdpWalletReady, setCdpWalletReady] = useState(false);
    const clientRef = useRef<YellowWebSocketClient | null>(null);
    const [isAutoApprovingChallenge, setIsAutoApprovingChallenge] = useState(false);

    // Check if CDP wallet is ready
    useEffect(() => {
        if (isInitialized && currentUser && evmAddress) {
            setCdpWalletReady(true);
        } else {
            setCdpWalletReady(false);
        }
    }, [isInitialized, currentUser, evmAddress]);

    // Auto-approve challenges when they are received (but only once per challenge)
    const challengeApprovedRef = useRef<boolean>(false);

    useEffect(() => {
        const autoApproveChallenge = async () => {
            if (
                clientRef.current &&
                clientRef.current.hasPendingChallenge &&
                status === 'pending_auth' &&
                !isAutoApprovingChallenge &&
                !challengeApprovedRef.current
            ) {
                console.log('Auto-approving Yellow WebSocket challenge...');
                challengeApprovedRef.current = true;
                setIsAutoApprovingChallenge(true);

                try {
                    await clientRef.current.approveChallenge();
                    console.log('Challenge approved automatically');
                } catch (error) {
                    console.error('Auto-challenge approval failed:', error);
                    setError(error instanceof Error ? error.message : 'Challenge approval failed');
                    challengeApprovedRef.current = false; // Reset on error to allow retry
                } finally {
                    setIsAutoApprovingChallenge(false);
                }
            }
        };

        autoApproveChallenge();
    }, [status, isAutoApprovingChallenge]);

    // Reset challenge approval flag when disconnected
    useEffect(() => {
        if (status === 'disconnected' || status === 'failed') {
            challengeApprovedRef.current = false;
        }
    }, [status]);

    // Initialize client on mount
    useEffect(() => {
        const client = createYellowWebSocketClient(options.config, {
            onConnect: () => {
                setError(null);
                options.onConnect?.();
            },
            onDisconnect: options.onDisconnect,
            onMessage: options.onMessage,
            onError: (err) => {
                setError(err.message);
                options.onError?.(err);
            },
            onAuthSuccess: options.onAuthSuccess,
            onAuthFailed: (errorMsg) => {
                setError(errorMsg);
                options.onAuthFailed?.(errorMsg);
            },
            onChallengeReceived: (challenge) => {
                console.log('Challenge received, will auto-approve...');
                options.onChallengeReceived?.(challenge);
            },
            onVerifyFailed: options.onVerifyFailed,
        });

        clientRef.current = client;

        // Listen to status changes
        const unsubscribe = client.onStatusChange(setStatus);

        return () => {
            unsubscribe();
            client.destroy();
            clientRef.current = null;
        };
    }, []);

    const connect = useCallback(
        async (walletAddress: string) => {
            if (!currentUser || !clientRef.current) {
                throw new Error('User not authenticated or client not available');
            }

            if (clientRef.current.isConnected) {
                return;
            }

            // Wait for CDP wallet to be ready
            if (!cdpWalletReady) {
                throw new Error('CDP wallet not ready - please wait for wallet to initialize');
            }

            if (!evmAddress) {
                throw new Error('EVM address not found');
            }

            console.log('Creating viem wallet client with CDP signing...');

            // Create a custom EIP-1193 provider that uses CDP's signing functions
            const cdpProvider = {
                request: async ({ method, params }: { method: string; params?: any[] }) => {
                    if (method === 'eth_accounts') {
                        return [evmAddress];
                    }
                    if (method === 'eth_chainId') {
                        return `0x${mainnet.id.toString(16)}`;
                    }
                    if (method === 'eth_signTypedData_v4' || method === 'eth_signTypedData') {
                        const [_, typedDataJson] = params || [];
                        const typedData = typeof typedDataJson === 'string' ? JSON.parse(typedDataJson) : typedDataJson;
                        const result = await signEvmTypedData({
                            evmAccount: evmAddress,
                            typedData: {
                                domain: typedData.domain,
                                types: typedData.types,
                                primaryType: typedData.primaryType,
                                message: typedData.message,
                            },
                        });
                        return result.signature;
                    }
                    throw new Error(`Unsupported method: ${method}`);
                },
            };

            // Create viem wallet client with custom CDP provider
            const walletClient = createWalletClient({
                account: evmAddress as Address,
                chain: mainnet,
                transport: custom(cdpProvider),
            });

            console.log('Viem wallet client created with CDP provider');

            // Create signing function using CDP's signEvmTypedData
            const signTypedData = async (args: { domain: any; types: any; primaryType: string; message: any }) => {
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
            };

            console.log('Connecting to Yellow WebSocket with CDP wallet...');

            // Connect with wallet client
            await clientRef.current.connect(walletAddress, signTypedData, walletClient);
        },
        [currentUser, evmAddress, cdpWalletReady, signEvmTypedData],
    );

    const disconnect = useCallback(() => {
        clientRef.current?.disconnect();
    }, []);

    const send = useCallback((data: any) => {
        if (!clientRef.current?.isConnected) {
            throw new Error('Not connected to Yellow WebSocket');
        }
        clientRef.current.send(data);
    }, []);

    const sendWithResponse = useCallback(async (data: any, options?: { timeout?: number }) => {
        if (!clientRef.current?.isConnected) {
            throw new Error('Not connected to Yellow WebSocket');
        }
        return await clientRef.current.sendWithResponse(data, options);
    }, []);

    const ping = useCallback(async () => {
        if (!clientRef.current) {
            throw new Error('Client not initialized');
        }
        await clientRef.current.ping();
    }, []);

    return {
        client: clientRef.current,
        status,
        connect,
        disconnect,
        send,
        sendWithResponse,
        ping,
        isConnected: status === 'connected',
        isConnecting: status === 'connecting',
        isAuthenticated: status === 'connected',
        error,
        sessionAddress: clientRef.current?.currentSessionAddress || null,
        retryCount: 0, // Could be extracted from client if needed
        privyWalletReady: cdpWalletReady, // Renamed from privyWalletReady for backwards compatibility
    };
};
