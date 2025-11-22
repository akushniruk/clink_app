import { Background } from '../components/ui/Background';
import {
    useCurrentUser,
    useEvmAddress,
    useIsInitialized,
    useSignInWithEmail,
    useVerifyEmailOTP,
    useSignInWithOAuth,
} from '@coinbase/cdp-hooks';
import { useState, useEffect } from 'preact/hooks';
import { trackPageView, trackLoginInitiated, trackLoginSuccess, trackLoginFailed } from '../utils/analytics';
import { EmailLoginForm } from '../components/login/EmailLoginForm';
import { OTPVerificationForm } from '../components/login/OTPVerificationForm';
import { LogoHeader } from '../components/login/LogoHeader';
import { BackButton } from '../components/login/BackButton';

export const LoginPage = () => {
    const [isLogging, setIsLogging] = useState(false);
    const [isCreatingWallet, setIsCreatingWallet] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
    const [loginType, setLoginType] = useState<'email' | 'google'>('email'); // Track which login method was used
    const [email, setEmail] = useState('');
    const [flowId, setFlowId] = useState<string>('');
    const [shouldClearOtp, setShouldClearOtp] = useState(false);
    const [lastFailedAttempt, setLastFailedAttempt] = useState<number>(0);
    const { isInitialized } = useIsInitialized();
    const { currentUser } = useCurrentUser();
    const { evmAddress } = useEvmAddress();
    const { signInWithEmail } = useSignInWithEmail();
    const { verifyEmailOTP } = useVerifyEmailOTP();
    const { signInWithOAuth } = useSignInWithOAuth();
    const [oauthLoading, setOauthLoading] = useState(false);
    const [emailState, setEmailState] = useState<{ status: string }>({ status: 'initial' });

    // Debug email state changes
    useEffect(() => {
        console.log('Email state changed:', emailState);
    }, [emailState]);

    // Track page view when component mounts
    useEffect(() => {
        trackPageView('login_page');
    }, []);

    // Track successful login when wallet is ready
    useEffect(() => {
        if (currentUser && evmAddress && isLogging) {
            console.log('Account setup completed successfully');
            trackLoginSuccess(loginType, currentUser.userId || 'unknown');
            setIsLogging(false);
            setIsCreatingWallet(false);
        }
    }, [currentUser, evmAddress, isLogging, loginType]);

    useEffect(() => {
        if (isInitialized) {
            console.log('CDP user object:', currentUser);
            if (currentUser && evmAddress) {
                console.log('User has wallet:', evmAddress);
            } else if (currentUser && !evmAddress) {
                console.log('User is authenticated but wallet not ready yet.');
            }
        }
    }, [isInitialized, currentUser, evmAddress]);

    const handleGoogleLogin = async () => {
        if (!isInitialized || isLogging || oauthLoading || isCreatingWallet) return;

        // Track login initiated
        trackLoginInitiated('google');

        setLoginType('google'); // Set login type for tracking
        setIsLogging(true);
        setIsCreatingWallet(true);
        setOauthLoading(true);
        try {
            console.log('Logging in with Google...');
            await signInWithOAuth('google');
            // CDP automatically creates wallet on OAuth login
            console.log('Google OAuth initiated');
        } catch (error) {
            console.error('Failed to login with Google:', error);
            trackLoginFailed('google', 'oauth_failed');
            setIsLogging(false);
            setIsCreatingWallet(false);
        } finally {
            setOauthLoading(false);
        }
    };

    const handleEmailSubmit = async (emailValue: string) => {
        if (!isInitialized || !emailValue || isLogging || emailState.status === 'sending-code') return;

        // Track login initiated
        trackLoginInitiated('email');

        setLoginType('email'); // Set login type for tracking
        setEmail(emailValue);
        setIsLogging(true);
        setEmailState({ status: 'sending-code' });
        try {
            console.log('Sending code to email:', emailValue);
            const result = await signInWithEmail({ email: emailValue });
            setFlowId(result.flowId);
            console.log('Email code sent successfully, flowId:', result.flowId);
            setLoginMethod('otp');
            setIsLogging(false);
            setEmailState({ status: 'awaiting-code' });
        } catch (error) {
            console.error('Failed to send email code:', error);
            trackLoginFailed('email', 'email_code_failed');
            setIsLogging(false);
            setEmailState({ status: 'error' });
        }
    };

    const handleOtpSubmit = async (code: string) => {
        if (!isInitialized || code.length !== 6 || isLogging || emailState.status === 'submitting-code') return;

        // Prevent spam - limit attempts to once per 2 seconds
        const now = Date.now();
        if (now - lastFailedAttempt < 2000) {
            console.log('Rate limited: Please wait before trying again');
            return;
        }

        console.log('OTP code entered:', code);
        setIsLogging(true);
        setIsCreatingWallet(true);
        setShouldClearOtp(false); // Reset clear flag
        setEmailState({ status: 'submitting-code' });

        try {
            console.log('Verifying OTP code...');
            await verifyEmailOTP({ flowId, otp: code });
            // CDP automatically creates wallet on successful email verification
            console.log('OTP verification successful');
            setEmailState({ status: 'success' });
        } catch (error) {
            console.error('Failed to verify OTP code:', error);
            trackLoginFailed('email', 'otp_verification_failed');
            setIsLogging(false);
            setIsCreatingWallet(false);
            setLastFailedAttempt(now);
            setShouldClearOtp(true); // Trigger OTP clearing
            setEmailState({ status: 'error' });
        }
    };

    const handleResendCode = async () => {
        if (!email || emailState.status === 'sending-code') return;

        setEmailState({ status: 'sending-code' });
        try {
            console.log('Resending code to email:', email);
            const result = await signInWithEmail({ email });
            setFlowId(result.flowId);
            console.log('Email code resent successfully');
            setEmailState({ status: 'awaiting-code' });
        } catch (error) {
            console.error('Failed to resend email code:', error);
            setEmailState({ status: 'error' });
        }
    };

    const handleBackToEmail = () => {
        setLoginMethod('email');
        setEmail('');
        setShouldClearOtp(false);
        setLastFailedAttempt(0);
        setIsLogging(false);
    };

    const handleOtpCleared = () => {
        setShouldClearOtp(false);
    };

    return (
        <div className="overflow-hidden">
            <Background />
            <div class="flex flex-col relative z-50">
                {loginMethod === 'email' && <LogoHeader />}
                {loginMethod === 'otp' && <BackButton onBack={handleBackToEmail} />}
                <div className="flex-1"></div>
                <div className="flex-shrink-0">
                    <div className="px-6 pb-6">
                        {!isInitialized ? (
                            <div className="w-full bg-cta text-white rounded-sm px-6 py-3 text-center font-semibold opacity-50">
                                Loading...
                            </div>
                        ) : loginMethod === 'email' ? (
                            <EmailLoginForm
                                onEmailSubmit={handleEmailSubmit}
                                onGoogleLogin={handleGoogleLogin}
                                isLoading={isLogging}
                                isGoogleLoading={oauthLoading}
                                isCreatingWallet={isCreatingWallet}
                                emailState={emailState}
                            />
                        ) : (
                            <OTPVerificationForm
                                email={email}
                                onOtpSubmit={handleOtpSubmit}
                                onResendCode={handleResendCode}
                                isLoading={isLogging}
                                emailState={emailState}
                                shouldClearOtp={shouldClearOtp}
                                onOtpCleared={handleOtpCleared}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
