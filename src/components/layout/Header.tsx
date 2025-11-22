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
    <div className="flex items-center gap-1">
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
                    className="hover:opacity-90 transition-opacity">
                    <NewButton />
                </button>
            )}
            {showHomeButton && (
                <button
                    onClick={() => route('/')}
                    className="hover:bg-[var(--color-cta-5)] rounded-full transition-colors">
                    <HomeButton />
                </button>
            )}
            {onAccountClick && (
                <button
                    onClick={onAccountClick}
                    className="hover:bg-[var(--color-cta-5)] rounded-full transition-colors">
                    <AccountIcon />
                </button>
            )}
        </div>
    </div>
);
