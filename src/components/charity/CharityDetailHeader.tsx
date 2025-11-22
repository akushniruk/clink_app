import { route } from 'preact-router';

interface CharityDetailHeaderProps {
    onBack?: () => void;
    onShare?: () => void;
}

export const CharityDetailHeader = ({ onBack, onShare }: CharityDetailHeaderProps) => {
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            route('/');
        }
    };

    const handleShare = () => {
        if (onShare) {
            onShare();
        }
    };

    return (
        <div className="flex justify-between items-center p-4">
            <button onClick={handleBack} className="p-2 hover:bg-[var(--color-shades-20)] rounded-full transition-colors">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-shades-100)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={handleShare}
                className="p-2 hover:bg-[var(--color-shades-20)] rounded-full transition-colors">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-shades-100)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
            </button>
        </div>
    );
};
