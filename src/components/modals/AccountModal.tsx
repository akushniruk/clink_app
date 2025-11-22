import { useState } from 'preact/hooks';
import { useSnapshot } from 'valtio';
import { CloseIcon, CopyIcon, ExitIcon, ShareIcon } from '../icons';
import { LanguageSwitcher } from '../ui';
import { useT } from '../../i18n';
import UserTagStore from '../../store/UserTagStore';
import { trackUserTagCopied, trackWalletAddressCopied } from '../../utils/analytics';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletAddress: string | null;
    onLogout: () => void;
}

interface InfoRowProps {
    label: string;
    value: string;
    isLoading?: boolean;
    onCopy?: () => void;
    isCopied?: boolean;
    onShare?: () => void;
    isShared?: boolean;
    disabled?: boolean;
}

const InfoRow = ({
    label,
    value,
    isLoading = false,
    onCopy,
    isCopied = false,
    onShare,
    isShared = false,
    disabled = false,
}: InfoRowProps) => {
    const t = useT();
    return (
        <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="font-['Sora'] font-semibold text-base truncate">
                        {isLoading ? <span className="text-white">Loading...</span> : value}
                    </div>
                    <span className="text-[var(--color-shades-50)] font-['Sora'] font-semibold text-base">
                        {label}:
                    </span>
                </div>
                <div className="flex gap-2">
                    {onShare && (
                        <button
                            onClick={onShare}
                            className={`h-15 w-15 flex items-center justify-center rounded-sm transition-colors flex-shrink-0 font-['Sora'] font-semibold text-sm ${
                                isShared
                                    ? 'bg-[var(--color-base-green)] text-black'
                                    : 'hover:bg-[var(--color-cta-4)] bg-[var(--color-cta)] text-white'
                            }`}
                            disabled={disabled}
                        >
                            {isShared ? t('account.shared') : <ShareIcon />}
                        </button>
                    )}
                    {onCopy && (
                        <button
                            onClick={onCopy}
                            className={`h-15 w-15 flex items-center justify-center rounded-sm transition-colors flex-shrink-0 font-['Sora'] font-semibold text-sm ${
                                isCopied
                                    ? 'bg-[var(--color-base-green)] text-black'
                                    : 'hover:bg-[var(--color-cta-4)] bg-[var(--color-cta)] text-white'
                            }`}
                            disabled={disabled}
                        >
                            {isCopied ? t('account.copied') : <CopyIcon />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AccountModal = ({ isOpen, onClose, walletAddress, onLogout }: AccountModalProps) => {
    const t = useT();
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [tagCopyFeedback, setTagCopyFeedback] = useState(false);
    const [shareFeedback, setShareFeedback] = useState(false);
    const [tagShareFeedback, setTagShareFeedback] = useState(false);
    const userTagState = useSnapshot(UserTagStore.state);

    if (!isOpen) return null;

    const handleCopyAddress = async () => {
        if (walletAddress) {
            try {
                await navigator.clipboard.writeText(walletAddress);

                // Track wallet address copied
                trackWalletAddressCopied(walletAddress);

                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
            } catch (err) {
                console.error('Failed to copy address:', err);
            }
        }
    };

    const handleCopyUserTag = async () => {
        if (userTagState.userTag) {
            try {
                await navigator.clipboard.writeText(userTagState.userTag);

                // Track user tag copied
                trackUserTagCopied(walletAddress || undefined);

                setTagCopyFeedback(true);
                setTimeout(() => setTagCopyFeedback(false), 2000);
            } catch (err) {
                console.error('Failed to copy user tag:', err);
            }
        }
    };

    const handleShareAddress = async () => {
        if (walletAddress) {
            const appUrl = `${window.location.origin}?address=${encodeURIComponent(walletAddress)}&source=pwa`;
            const shareText = t('account.share.addressText', { address: walletAddress, url: appUrl });

            if (navigator.share) {
                try {
                    await navigator.share({
                        text: shareText,
                    });
                    setShareFeedback(true);
                    setTimeout(() => setShareFeedback(false), 2000);
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            } else {
                // Fallback to clipboard
                try {
                    await navigator.clipboard.writeText(shareText);
                    setShareFeedback(true);
                    setTimeout(() => setShareFeedback(false), 2000);
                } catch (err) {
                    console.error('Failed to copy share text:', err);
                }
            }
        }
    };

    const handleShareUserTag = async () => {
        if (userTagState.userTag) {
            const appUrl = `${window.location.origin}?tag=${encodeURIComponent(userTagState.userTag)}&source=pwa`;
            const shareText = t('account.share.tagText', { tag: userTagState.userTag, url: appUrl });

            if (navigator.share) {
                try {
                    await navigator.share({
                        text: shareText,
                    });
                    setTagShareFeedback(true);
                    setTimeout(() => setTagShareFeedback(false), 2000);
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            } else {
                // Fallback to clipboard
                try {
                    await navigator.clipboard.writeText(shareText);
                    setTagShareFeedback(true);
                    setTimeout(() => setTagShareFeedback(false), 2000);
                } catch (err) {
                    console.error('Failed to copy share text:', err);
                }
            }
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[var(--color-shades-blur-10)]"
                style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full h-full flex flex-col px-6">
                {/* Modal Header */}
                <div className="flex-shrink-0 flex justify-between items-center py-4 w-full border-b border-[var(--color-shades-20)]">
                    <h2 className="text-white font-['Sora'] font-semibold text-4xl">{t('account.title')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-cta-5)] rounded-full transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 pt-6">
                    {/* Account Information */}
                    <InfoRow
                        label={t('account.id')}
                        value={walletAddress ? formatAddress(walletAddress) : t('account.noAddress')}
                        onCopy={handleCopyAddress}
                        isCopied={copyFeedback}
                        onShare={handleShareAddress}
                        isShared={shareFeedback}
                        disabled={!walletAddress}
                    />

                    {(userTagState.loading || userTagState.userTag) && (
                        <InfoRow
                            label={t('account.userTag')}
                            value={userTagState.userTag || ''}
                            isLoading={userTagState.loading}
                            onCopy={handleCopyUserTag}
                            isCopied={tagCopyFeedback}
                            onShare={handleShareUserTag}
                            isShared={tagShareFeedback}
                            disabled={!userTagState.userTag || userTagState.loading}
                        />
                    )}

                    {/* Language Selector */}
                    <div className="mb-6">
                        <LanguageSwitcher />
                    </div>

                    {/* Divider */}
                    <div className="border-b border-[var(--color-shades-20)] mb-6"></div>

                    {/* Logout Section */}
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-between w-full py-2 hover:bg-[var(--color-cta-5)] rounded-sm transition-colors"
                    >
                        <span className="text-[var(--color-cta)] font-['Sora'] font-medium text-lg">
                            {t('account.logout')}
                        </span>
                        <ExitIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};
