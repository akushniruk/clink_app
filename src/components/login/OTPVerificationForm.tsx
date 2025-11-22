import { useEffect } from 'preact/hooks';
import { useTranslation } from '../../i18n';
import { useOtpInput } from '../../hooks/useOtpInput';

interface OTPVerificationFormProps {
    email: string;
    onOtpSubmit: (code: string) => Promise<void>;
    onResendCode: () => Promise<void>;
    isLoading: boolean;
    emailState: any;
    shouldClearOtp?: boolean;
    onOtpCleared?: () => void;
}

export const OTPVerificationForm = ({
    email,
    onOtpSubmit,
    onResendCode,
    isLoading,
    emailState,
    shouldClearOtp = false,
    onOtpCleared,
}: OTPVerificationFormProps) => {
    const { t } = useTranslation();
    const { otpCode, handleOtpChange, handleOtpPaste, handleBackspace, resetOtp, isComplete, getCode } = useOtpInput(6);

    // Clear OTP when verification fails
    useEffect(() => {
        if (shouldClearOtp) {
            resetOtp();
            onOtpCleared?.();
            // Focus first input after clearing
            setTimeout(() => {
                const firstInput = document.querySelector('input[name="code-0"]') as HTMLInputElement;
                if (firstInput) firstInput.focus();
            }, 10);
        }
    }, [shouldClearOtp, resetOtp, onOtpCleared]);

    // Auto-submit when all fields are filled
    useEffect(() => {
        if (isComplete()) {
            const finalCode = getCode();
            console.log('Auto-submitting OTP code:', finalCode);
            setTimeout(() => onOtpSubmit(finalCode), 100);
        }
    }, [otpCode, isComplete, getCode, onOtpSubmit]);

    const handleSubmit = () => {
        if (isComplete()) {
            onOtpSubmit(getCode());
        }
    };

    const handleInputChange = (index: number, value: string) => {
        const newOtpCode = handleOtpChange(index, value);
        if (newOtpCode && newOtpCode.every((digit) => digit !== '') && newOtpCode.join('').length === 6) {
            const finalCode = newOtpCode.join('');
            console.log('Auto-submitting OTP code:', finalCode);
            setTimeout(() => onOtpSubmit(finalCode), 100);
        }
    };

    const handleInputPaste = (e: ClipboardEvent, index: number) => {
        const newOtpCode = handleOtpPaste(e, index);
        if (newOtpCode && newOtpCode.every((digit) => digit !== '') && newOtpCode.join('').length === 6) {
            const finalCode = newOtpCode.join('');
            console.log('Auto-submitting pasted OTP code:', finalCode);
            setTimeout(() => onOtpSubmit(finalCode), 100);
        }
    };

    const handleResend = async () => {
        if (emailState.status === 'sending-code') return;
        resetOtp();
        await onResendCode();
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-[500px] px-6">
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="bg-cta-3 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-cta"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                    </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{t('login.otp.title')}</h3>
                <p className="text-shades-80 text-sm px-4 leading-relaxed mb-2">
                    {t('login.otp.description', { email })}
                </p>
            </div>

            {/* OTP Input Section */}
            <div className="w-full">
                <div className="flex justify-center items-center gap-3 mb-8">
                    {otpCode.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]"
                            value={digit}
                            onChange={(e) => handleInputChange(index, (e.target as HTMLInputElement).value)}
                            onPaste={(e) => handleInputPaste(e as any, index)}
                            onKeyDown={(e) => {
                                if (e.key === 'Backspace') {
                                    handleBackspace(index, digit);
                                } else if (e.key === 'Enter' && isComplete()) {
                                    handleSubmit();
                                }
                            }}
                            name={`code-${index}`}
                            maxLength={1}
                            autoComplete="off"
                            className="w-12 h-14 text-center bg-shades-10 border-2 border-shades-30 rounded-sm text-white text-lg font-bold focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/20 transition-all duration-200 hover:border-shades-50"
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!isComplete() || isLoading || emailState.status === 'submitting-code'}
                    className="w-full bg-cta text-white rounded-sm px-6 py-4 hover:bg-cta/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
                >
                    {isLoading || emailState.status === 'submitting-code' ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <span>Verify Code</span>
                    )}
                </button>

                {/* Resend Code Section */}
                <div className="flex justify-center items-center">
                    <p className="text-shades-80 text-sm">{t('login.otp.didntReceive')}</p>
                    <button
                        onClick={handleResend}
                        disabled={emailState.status === 'sending-code'}
                        className="hover:text-cta/80 transition-colors pl-3 text-sm underline disabled:opacity-50"
                    >
                        {emailState.status === 'sending-code' ? t('login.otp.resending') : t('login.otp.resendCode')}
                    </button>
                </div>
            </div>
        </div>
    );
};
