/**
 * Formats a number as an integer with thousand separators
 * @param value - The value to format
 * @returns Formatted string with separators as integer
 */
export const formatSignificantWithSeparators = (value: string | number): string => {
    if (!value || value === '0' || value === 0) return '0';

    try {
        const num = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);

        if (isNaN(num) || num === 0) return '0';

        // Format as integer with thousand separators
        return new Intl.NumberFormat('en-US').format(num);
    } catch (error) {
        console.error('Error formatting number:', error);
        return '0';
    }
};

/**
 * Formats an address to show first 6 and last 4 characters
 * @param address - The address to format
 * @returns Formatted address string
 */
export const formatAddressShort = (address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
