import { QRScanIcon } from '../icons';
import { useT } from '../../i18n';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    children: any;
    onClick?: () => void;
    disabled?: boolean;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    icon?: 'qr' | 'none';
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

const getVariantStyles = (variant: ButtonVariant) => {
    switch (variant) {
        case 'primary':
            return {
                className: 'text-[var(--color-base-red)]',
                style: {
                    background: 'var(--color-cta)',
                },
            };
        case 'secondary':
            return {
                className: 'text-[var(--color-cta)] bg-[var(--color-cta-5)]',
                style: {},
            };
        case 'outline':
            return {
                className: 'text-[var(--color-base-red)] bg-transparent border border-white/30',
                style: {},
            };
        case 'danger':
            return {
                className: 'text-[var(--color-base-red)]',
                style: {
                    background: 'linear-gradient(to bottom, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))',
                    WebkitBackground: 'linear-gradient(to bottom, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))',
                },
            };
        default:
            return {
                className: 'text-[var(--color-base-red)]',
                style: {
                    background: 'var(--color-cta)',
                },
            };
    }
};

const getSizeStyles = (size: ButtonSize) => {
    switch (size) {
        case 'sm':
            return 'h-10 px-3 text-sm';
        case 'md':
            return 'h-12 px-4 text-base';
        case 'lg':
            return 'h-16 px-4 text-xl';
        default:
            return 'h-16 px-4 text-xl';
    }
};

export const Button = ({
    children,
    onClick,
    disabled = false,
    variant = 'primary',
    size = 'lg',
    fullWidth = false,
    icon = 'none',
    className = '',
    type = 'button',
}: ButtonProps) => {
    const variantStyles = getVariantStyles(variant);
    const sizeStyles = getSizeStyles(size);

    const baseClasses = `
        flex items-center justify-center rounded-[4px]
        font-['Sora'] font-semibold leading-6
        text-[var(--color-base-red)]
        transition-opacity hover:opacity-90
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${sizeStyles}
        ${variantStyles.className}
        ${className}
    `
        .trim()
        .replace(/\s+/g, ' ');

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={baseClasses} style={variantStyles.style}>
            {icon === 'qr' && <QRScanIcon />}
            {children}
        </button>
    );
};

// Specific button variants for common use cases
export const PayButton = ({
    onClick,
    disabled = false,
    className = '',
}: {
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}) => {
    const t = useT();
    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            variant="primary"
            size="lg"
            fullWidth
            icon="qr"
            className={className}
        >
            {t('ui.pay')}
        </Button>
    );
};

export const PayByTagButton = ({ onClick }: { onClick?: () => void; disabled?: boolean; className?: string }) => {
    const t = useT();
    return (
        <button onClick={onClick} className="flex items-center w-full justify-center mt-3">
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M15.7083 3.33325C16.0948 3.33325 16.4655 3.48673 16.7388 3.75995C16.8744 3.89538 16.9819 4.05621 17.0553 4.23325C17.1287 4.41028 17.1664 4.60005 17.1663 4.79168C17.1663 4.98331 17.1285 5.17306 17.055 5.35005C16.9815 5.52705 16.8739 5.68782 16.7383 5.82318L15.0712 7.49023C14.9181 7.64337 14.6698 7.64337 14.5166 7.49023L13.0106 5.98416C12.8575 5.8311 12.8574 5.58296 13.0104 5.42978L14.6778 3.75995C14.9512 3.48673 15.3218 3.33325 15.7083 3.33325Z"
                    fill="var(--color-secondary)"
                />
                <path
                    d="M11.6686 6.77026C11.8218 6.61712 12.07 6.61713 12.2232 6.77027L13.7291 8.27615C13.8822 8.42929 13.8822 8.67758 13.7291 8.83072L6.00887 16.5515C5.93532 16.625 5.83558 16.6663 5.73157 16.6663H4.22516C4.00858 16.6663 3.83301 16.4908 3.83301 16.2742V14.7678C3.83301 14.6638 3.87433 14.564 3.94788 14.4905L11.6686 6.77026Z"
                    fill="var(--color-secondary)"
                />
            </svg>
            <span className="ml-2 text-[var(--color-secondary)] font-semibold font-['Sora'] py-1.5">
                {t('ui.payByTag')}
            </span>
        </button>
    );
};

export const ContinueButton = ({
    onClick,
    disabled = false,
    className = '',
}: {
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}) => {
    const t = useT();
    return (
        <Button onClick={onClick} disabled={disabled} variant="primary" size="lg" fullWidth className={className}>
            {t('ui.continue')}
        </Button>
    );
};

export const CancelButton = ({
    onClick,
    disabled = false,
    className = '',
}: {
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}) => {
    const t = useT();
    return (
        <Button onClick={onClick} disabled={disabled} variant="outline" size="lg" fullWidth className={className}>
            {t('common.cancel')}
        </Button>
    );
};
