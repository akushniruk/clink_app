import { isValidUserTag } from './walletValidation';

export const formatAddress = (address: string): string =>
    isValidUserTag(address) ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;

export const formatTransactionId = (txId: string): string => `${txId.slice(0, 8)}...${txId.slice(-8)}`;
