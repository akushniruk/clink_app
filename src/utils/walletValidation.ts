/**
 * Utility functions for validating EVM wallet addresses and user tags
 */

/**
 * Check if a string is a valid EVM wallet address
 * @param address - The address string to validate
 * @returns True if the address is a valid EVM address
 */
export function isValidEvmAddress(address: string): boolean {
    // EVM addresses are 42 characters long (0x + 40 hex chars)
    if (!address || typeof address !== 'string') {
        return false;
    }

    // Remove any whitespace and convert to lowercase
    const cleanAddress = address.trim().toLowerCase();

    // Check if it starts with 0x and has exactly 42 characters
    if (!cleanAddress.startsWith('0x') || cleanAddress.length !== 42) {
        return false;
    }

    // Check if all characters after 0x are valid hexadecimal
    const hexPart = cleanAddress.slice(2);
    const hexRegex = /^[0-9a-f]+$/;

    return hexRegex.test(hexPart);
}

/**
 * Check if a string is a valid user tag
 * @param userTag - The user tag string to validate
 * @returns True if the tag is valid
 */
export function isValidUserTag(userTag: string): boolean {
    if (!userTag || typeof userTag !== 'string') {
        return false;
    }

    const trimmed = userTag.trim();

    // User tags cannot start with "0x" (that's for wallet addresses)
    if (trimmed.toLowerCase().startsWith('0x')) {
        return false;
    }

    return /^[0-9A-Za-z]+$/.test(trimmed) && trimmed.length > 0;
}

/**
 * Check if the scanned address is the user's own address
 * @param scannedAddress - The scanned wallet address
 * @param userAddress - The user's wallet address
 * @returns True if the addresses match (case-insensitive)
 */
export function isOwnAddress(scannedAddress: string, userAddress: string): boolean {
    if (!scannedAddress || !userAddress) {
        return false;
    }

    return scannedAddress.toLowerCase() === userAddress.toLowerCase();
}

/**
 * Normalize an EVM address to standard format (0x + lowercase)
 * @param address - The address to normalize
 * @returns Normalized address or empty string if invalid
 */
export function normalizeEvmAddress(address: string): string {
    if (!isValidEvmAddress(address)) {
        return '';
    }

    return address.trim().toLowerCase();
}

export function extractTagFromUrl(value: string): string | undefined {
    try {
        const url = new URL(value);
        return url.searchParams.get('tag') || undefined;
    } catch {}
}

/**
 * Parse input data to extract wallet address or user tag
 * Handles various formats that might contain wallet addresses or user tags
 * @param inputData - The raw input data
 * @returns Extracted wallet address, user tag, or null if not found/invalid
 */
export function parseWalletAddressFromQR(inputData: string): string | null {
    if (!inputData || typeof inputData !== 'string') {
        return null;
    }

    const trimmed = inputData.trim();

    // Case 1: Direct wallet address (starts with 0x)
    if (trimmed.startsWith('0x') && isValidEvmAddress(trimmed)) {
        return normalizeEvmAddress(trimmed);
    }

    // Case 2: Direct user tag (any alphanumeric string that's not an address)
    if (!trimmed.startsWith('0x') && isValidUserTag(trimmed)) {
        return trimmed;
    }

    // Case 3: ethereum: URI format (ethereum:0x...)
    const ethereumUriMatch = trimmed.match(/^ethereum:([0-9a-fA-F]{40}|0x[0-9a-fA-F]{40})/i);
    if (ethereumUriMatch) {
        const address = ethereumUriMatch[1].startsWith('0x') ? ethereumUriMatch[1] : '0x' + ethereumUriMatch[1];
        if (isValidEvmAddress(address)) {
            return normalizeEvmAddress(address);
        }
    }

    // Case 4: JSON format containing address field or user tag
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed.userTag && isValidUserTag(parsed.userTag)) {
            return parsed.userTag;
        }
        if (parsed.address && isValidEvmAddress(parsed.address)) {
            return normalizeEvmAddress(parsed.address);
        }
        if (parsed.wallet && isValidEvmAddress(parsed.wallet)) {
            return normalizeEvmAddress(parsed.wallet);
        }
        if (parsed.recipient && isValidEvmAddress(parsed.recipient)) {
            return normalizeEvmAddress(parsed.recipient);
        }
    } catch {
        // Not JSON, continue with other formats
    }

    // Case 5: URL with wallet address or user tag parameter
    try {
        const url = new URL(trimmed);
        const userTagFromParam = url.searchParams.get('userTag') || url.searchParams.get('tag');
        if (userTagFromParam && isValidUserTag(userTagFromParam)) {
            return userTagFromParam;
        }
        const addressFromParam =
            url.searchParams.get('address') || url.searchParams.get('wallet') || url.searchParams.get('to');
        if (addressFromParam && isValidEvmAddress(addressFromParam)) {
            return normalizeEvmAddress(addressFromParam);
        }
    } catch {
        // Not a valid URL, continue
    }

    // Case 6: Extract any valid-looking address from the string
    const addressMatch = trimmed.match(/(0x[0-9a-fA-F]{40})/i);
    if (addressMatch && isValidEvmAddress(addressMatch[1])) {
        return normalizeEvmAddress(addressMatch[1]);
    }

    return null;
}

/**
 * Check if the scanned user tag is the user's own user tag
 * @param scannedTag - The scanned user tag
 * @param userTag - The user's own user tag
 * @returns True if the tags match (case-insensitive)
 */
export function isOwnUserTag(scannedTag: string, userTag: string): boolean {
    if (!scannedTag || !userTag) {
        return false;
    }

    return scannedTag.toUpperCase() === userTag.toUpperCase();
}

/**
 * Validation result type for QR scanning
 */
export interface QRValidationResult {
    isValid: boolean;
    address: string | null;
    userTag: string | null;
    error: 'invalid_qr' | 'invalid_address' | 'invalid_user_tag' | 'own_address' | 'own_user_tag' | null;
}

/**
 * Comprehensive QR code validation for wallet payments
 * @param qrData - The raw QR code data
 * @param userAddress - The user's wallet address to prevent self-payment
 * @param userTag - The user's own user tag to prevent self-payment
 * @returns Validation result with error details
 */
export function validateQRForPayment(qrData: string, userAddress: string, userTag?: string): QRValidationResult {
    // Extract wallet address or user tag from QR data
    const extractedValue = parseWalletAddressFromQR(qrData);

    if (!extractedValue) {
        return {
            isValid: false,
            address: null,
            userTag: null,
            error: 'invalid_qr',
        };
    }

    // Check if it's a user tag
    if (userTag && isValidUserTag(extractedValue)) {
        // Check if user is trying to pay themselves
        if (isOwnUserTag(extractedValue, userTag)) {
            return {
                isValid: false,
                address: null,
                userTag: extractedValue,
                error: 'own_user_tag',
            };
        }

        return {
            isValid: true,
            address: null,
            userTag: extractedValue,
            error: null,
        };
    }

    // Check if it's a valid EVM address
    if (isValidEvmAddress(extractedValue)) {
        // Check if user is trying to pay themselves
        if (isOwnAddress(extractedValue, userAddress)) {
            return {
                isValid: false,
                address: extractedValue,
                userTag: null,
                error: 'own_address',
            };
        }

        return {
            isValid: true,
            address: extractedValue,
            userTag: null,
            error: null,
        };
    }

    // If we reach here, it's neither a valid address nor a valid user tag
    return {
        isValid: false,
        address: null,
        userTag: null,
        error: 'invalid_qr',
    };
}
