import { useSnapshot } from 'valtio';
import RequestStore from '../store/RequestStore';
import type { RequestID } from '@erc7824/nitrolite';

/**
 * React hook to track the status of a specific request
 */
export function useRequestStatus(requestId: RequestID | undefined) {
    const snapshot = useSnapshot(RequestStore.state);

    if (!requestId) {
        return {
            status: 'not_found' as const,
            response: undefined,
            error: undefined,
            requestInfo: undefined,
        };
    }

    const pendingRequest = snapshot.pendingRequests.get(requestId);
    if (pendingRequest) {
        return {
            status: 'pending' as const,
            response: undefined,
            error: undefined,
            requestInfo: pendingRequest.requestInfo,
        };
    }

    const completedRequest = snapshot.completedRequests.get(requestId);
    if (completedRequest) {
        return {
            status: completedRequest.status,
            response: completedRequest.response,
            error: completedRequest.error,
            requestInfo: completedRequest.requestInfo,
        };
    }

    return {
        status: 'not_found' as const,
        response: undefined,
        error: undefined,
        requestInfo: undefined,
    };
}

/**
 * React hook that resolves when a request completes (success or failure)
 * Returns null until the request is completed
 */
export function useRequestResult(requestId: RequestID | undefined) {
    const status = useRequestStatus(requestId);
    if (status.status === 'success' || status.status === 'failed') {
        return status;
    }
    return null;
}

export default useRequestStatus;
