import { useState } from 'preact/hooks';
import { UserIcon, HomeIcon, PlusIcon } from '@heroicons/react/24/solid';
import logo from '/logo.png';
import { route } from 'preact-router';

const AccountIcon = () => (
    <div className="p-2 bg-[var(--color-base-green-1)] rounded-md">
        <UserIcon className="w-7 h-7 text-[var(--color-base-green)]" />
    </div>
);

const HomeButton = () => (
    <div className="p-2 bg-[var(--color-cta-3)] rounded-md">
        <HomeIcon className="w-7 h-7 text-[var(--color-cta)]" />
    </div>
);

const NewButton = () => (
    <div className="flex items-center gap-1 px-3 py-2.5">
        <PlusIcon className="w-5 h-5 text-[var(--color-shades-100)]" />
        <span className="text-[var(--color-shades-100)] text-sm font-semibold">New</span>
    </div>
);

const ClinkLogo = () => {
    const [isLogoLoaded, setIsLogoLoaded] = useState(false);

    return (
        <div className="flex items-center">
            <img
                src={logo}
                alt="Clink"
                className={`w-12 ${isLogoLoaded ? 'loaded' : ''}`}
                onLoad={() => setIsLogoLoaded(true)}
            />
            <h1 className="text-xl font-semibold">Clink</h1>
        </div>
    );
};

interface HeaderProps {
    onAccountClick?: () => void;
    showHomeButton?: boolean;
    onNewClick?: () => void;
}

export const Header = ({ onAccountClick, showHomeButton = false, onNewClick }: HeaderProps) => (
    <div className="flex-shrink-0 flex justify-between items-center pb-3">
        <ClinkLogo />
        <div className="flex gap-2">
            {onNewClick && (
                <button
                    onClick={onNewClick}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-[var(--color-cta-3)] rounded-md hover:bg-[var(--color-cta-4)] active:bg-[var(--color-cta-2)] transition-colors touch-manipulation">
                    <NewButton />
                </button>
            )}
            {showHomeButton && (
                <button
                    onClick={() => route('/')}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[var(--color-cta-5)] active:bg-[var(--color-cta-4)] rounded-full transition-colors touch-manipulation">
                    <HomeButton />
                </button>
            )}
            {onAccountClick && (
                <button
                    onClick={onAccountClick}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[var(--color-base-green-2)] active:bg-[var(--color-base-green-3)] rounded-full transition-colors touch-manipulation">
                    <AccountIcon />
                </button>
            )}
        </div>
    </div>
);
