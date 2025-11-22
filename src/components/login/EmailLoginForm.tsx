import { useState } from 'preact/hooks';
import { useTranslation } from '../../i18n';

interface EmailLoginFormProps {
    onEmailSubmit: (email: string) => Promise<void>;
    onGoogleLogin: () => Promise<void>;
    isLoading: boolean;
    isGoogleLoading: boolean;
    isCreatingWallet: boolean;
    emailState: any;
}

export const EmailLoginForm = ({
    onEmailSubmit,
    onGoogleLogin,
    isLoading,
    isGoogleLoading,
    isCreatingWallet,
    emailState,
}: EmailLoginFormProps) => {
    const [email, setEmail] = useState('');
    const { t } = useTranslation();

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = () => {
        if (email && isValidEmail(email)) {
            onEmailSubmit(email);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-shades-10 rounded-sm px-4 py-3 border border-shades-20">
                <div className="flex items-center gap-3">
                    <svg
                        className="w-6 h-6 text-cta flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                    </svg>
                    <input
                        type="email"
                        placeholder={t('login.email.placeholder')}
                        value={email}
                        onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                        className="flex-1 bg-transparent text-white placeholder-shades-70 outline-none min-w-0"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!email || !isValidEmail(email) || isLoading || emailState.status === 'sending-code'}
                        className="bg-cta text-white px-3 py-2 rounded-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-cta/90 transition-colors flex-shrink-0"
                    >
                        {isLoading || emailState.status === 'sending-code' ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>{t('login.email.sending')}</span>
                            </>
                        ) : (
                            <span>{t('login.email.submit')}</span>
                        )}
                    </button>
                </div>
            </div>
            <button
                onClick={onGoogleLogin}
                disabled={isLoading || isGoogleLoading || isCreatingWallet}
                className="w-full bg-cta text-white rounded-sm px-6 py-3 hover:bg-cta/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {isLoading || isGoogleLoading || isCreatingWallet ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {isCreatingWallet ? 'Setting up your account...' : 'Signing In...'}
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {t('login.methods.google')}
                    </>
                )}
            </button>
        </div>
    );
};
