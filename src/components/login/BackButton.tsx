interface BackButtonProps {
    onBack: () => void;
}

export const BackButton = ({ onBack }: BackButtonProps) => {
    return (
        <div className="absolute top-6 left-6 z-50">
            <button onClick={onBack} className="p-2 text-white hover:text-cta transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
        </div>
    );
};
