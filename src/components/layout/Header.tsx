import { useState } from 'preact/hooks';
import { UserIcon } from '@heroicons/react/24/solid';
import logo from '/logo.png';

const AccountIcon = () => (
    <div className="p-2 bg-[var(--color-base-green-1)] rounded-md">
        <UserIcon className="w-7 h-7 text-[var(--color-base-green)]" />
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
    onAccountClick: () => void;
}

export const Header = ({ onAccountClick }: HeaderProps) => (
    <div className="flex-shrink-0 flex justify-between items-center pb-3">
        <ClinkLogo />
        <button onClick={onAccountClick} className="hover:bg-[var(--color-cta-5)] rounded-full transition-colors">
            <AccountIcon />
        </button>
    </div>
);
