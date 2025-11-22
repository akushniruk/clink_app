import { useState, useEffect, useCallback } from 'preact/hooks';

export interface ShareLinkParams {
    recipientAddress?: string;
    recipientTag?: string;
    amount?: string;
    isFromSharedLink: boolean;
    isPaymentRequest: boolean;
}

// Static initial state for performance
const INITIAL_PARAMS: ShareLinkParams = {
    isFromSharedLink: false,
    isPaymentRequest: false,
};

export const useShareLinkParams = (): ShareLinkParams => {
    const [params, setParams] = useState<ShareLinkParams>(INITIAL_PARAMS);

    // Parse URL parameters for shared link detection
    const parseUrlParams = useCallback(() => {
        const urlParams = new URLSearchParams(window.location.search);

        if (!urlParams.toString()) {
            return INITIAL_PARAMS;
        }

        const recipientAddress = urlParams.get('address');
        const recipientTag = urlParams.get('tag');
        const amount = urlParams.get('amount');
        const isFromSharedLink = !!(recipientAddress || recipientTag);

        return {
            recipientAddress: recipientAddress || undefined,
            recipientTag: recipientTag || undefined,
            amount: amount || undefined,
            isFromSharedLink,
            isPaymentRequest: isFromSharedLink,
        };
    }, []);

    useEffect(() => {
        const parsedParams = parseUrlParams();

        if (parsedParams.isFromSharedLink) {
            setParams(parsedParams);
            // Clean URL after parsing
            const cleanUrl = `${window.location.origin}${window.location.pathname}`;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }, [parseUrlParams]);

    return params;
};
