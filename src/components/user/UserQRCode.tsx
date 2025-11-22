import { QRCode } from 'react-qrcode-logo';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { useT } from '../../i18n';
import { useSnapshot } from 'valtio';
import UserTagStore from '../../store/UserTagStore';

interface UserQRCodeProps {
    userId: string;
    className?: string;
}

export function UserQRCode({ userId, className = '' }: UserQRCodeProps) {
    const userTagState = useSnapshot(UserTagStore.state);
    const t = useT();

    // Standard high contrast colors for maximum scanner compatibility
    const qrBgColor = '#ffffff';
    const qrFgColor = '#000000';

    // Responsive QR size based on screen height
    // iPhone SE (667px height) gets smallest size, larger screens get bigger QR codes
    const getQRSize = () => {
        if (typeof window === 'undefined') return 180; // SSR fallback

        const vh = window.innerHeight;
        if (vh <= 667) return 180; // iPhone SE and smaller
        if (vh <= 736) return 180; // iPhone 6/7/8 Plus
        if (vh <= 812) return 200; // iPhone X/11 Pro
        return 200; // Larger screens
    };

    const [qrSize, setQrSize] = useState(getQRSize);
    const logoSize = Math.round(qrSize * 0.2); // Logo is 20% of QR size

    // Handle window resize for responsive QR code
    useEffect(() => {
        setQrSize(getQRSize());
    }, []);

    const qrCodeValue = useMemo(() => {
        if (typeof window === 'undefined') return userId; // SSR fallback

        return `${window.location.origin}?tag=${userId}`;
    }, [userId, typeof window]);

    return (
        <div className={`flex flex-col items-center relative ${className}`}>
            <div className="bg-white p-4 rounded-2xl border-2 border-gray-200">
                <QRCode
                    value={qrCodeValue}
                    size={qrSize}
                    logoImage="/qr-logo.png"
                    logoHeight={logoSize}
                    logoWidth={logoSize}
                    logoPadding={8}
                    logoPaddingStyle="square"
                    style={{
                        borderRadius: '8px',
                    }}
                    qrStyle="squares"
                    removeQrCodeBehindLogo={false}
                    eyeRadius={0}
                    quietZone={8}
                    bgColor={qrBgColor}
                    fgColor={qrFgColor}
                />
            </div>
            <p className="absolute font-['Sora'] font-semibold text-black bottom-[58px]">{userTagState.userTag}</p>
            <p className="text-center text-white text-sm font-medium leading-tight mt-2 px-4 pb-8 h-[49px]">
                {t('account.topUpInstruction')}
            </p>
        </div>
    );
}
