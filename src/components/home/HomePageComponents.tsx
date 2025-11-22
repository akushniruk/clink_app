export const TabButton = ({
    isActive,
    onClick,
    children,
}: {
    isActive: boolean;
    onClick: () => void;
    children: string;
}) => (
    <button
        onClick={onClick}
        className={`flex-1 inline-flex items-center justify-center whitespace-nowrap px-6 py-3 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
            isActive
                ? 'border-b-2 border-[var(--color-cta)] text-white bg-transparent'
                : 'border-b-2 border-transparent text-[var(--color-shades-50)] hover:text-[var(--color-shades-80)]'
        }`}
    >
        {children}
    </button>
);
