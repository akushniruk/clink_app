import { Background } from '../components/ui/Background';
import { usePrivy, useCreateWallet, useLoginWithOAuth, useLoginWithEmail } from '@privy-io/react-auth';
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
    const [email, setEmail] = useState('');
    const [shouldClearOtp, setShouldClearOtp] = useState(false);
    const [lastFailedAttempt, setLastFailedAttempt] = useState<number>(0);
    const { ready, authenticated, user } = usePrivy();
    const { createWallet } = useCreateWallet();
    const { initOAuth, loading: oauthLoading } = useLoginWithOAuth();
    const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail();

    // Debug email state changes
    useEffect(() => {
        console.log('Email state changed:', emailState);
    }, [emailState]);

    // Track page view when component mounts
    useEffect(() => {
        trackPageView('login_page');
    }, []);

    // // Only redirect from login page if user is authenticated AND has a wallet
    // if (authenticated && user?.wallet?.address) {
    //     return null;
    // }

    // Handle wallet creation after Google login
    useEffect(() => {
        const handleWalletCreation = async () => {
            if (authenticated && user && !user.wallet && !isCreatingWallet) {
                console.log('User authenticated, setting up account...');
                setIsCreatingWallet(true);
                try {
                    await createWallet();
                    console.log('Account setup completed successfully');

                    // Track successful login completion
                    const method = user.google?.email ? 'google' : 'email';
                    trackLoginSuccess(method, user.id || 'unknown');

                    // Wallet created successfully, user will be redirected to HomePage
                    setIsLogging(false);
                } catch (error) {
                    console.error('Failed to set up account:', error);
                    const method = user.google?.email ? 'google' : 'email';
                    trackLoginFailed(method, 'wallet_creation_failed', user.id);
                    setIsLogging(false);
                } finally {
                    setIsCreatingWallet(false);
                }
            }
        };

        handleWalletCreation();
    }, [authenticated, user, createWallet, isCreatingWallet]);

    useEffect(() => {
        if (ready) {
            console.log('Privy user object:', user);
            if (user && user.wallet) {
                console.log('User has wallet:', user.wallet);
            } else if (authenticated && user && !user.wallet) {
                console.log('User is authenticated but has no wallet yet.');
            }
        }
    }, [ready, authenticated, user]);

    const handleGoogleLogin = async () => {
        if (!ready || isLogging || oauthLoading || isCreatingWallet) return;

        // Track login initiated
        trackLoginInitiated('google');

        setIsLogging(true);
        try {
            console.log('Logging in with Google...');
            await initOAuth({ provider: 'google' });
            // Wallet creation will be handled by useEffect after authentication
            console.log('Google OAuth initiated');
        } catch (error) {
            console.error('Failed to login with Google:', error);
            trackLoginFailed('google', 'oauth_failed');
            setIsLogging(false);
        }
        // Don't set isLogging(false) here - let it stay true until wallet is created
    };

    const handleEmailSubmit = async (emailValue: string) => {
        if (!ready || !emailValue || isLogging || emailState.status === 'sending-code') return;

        // Track login initiated
        trackLoginInitiated('email');

        setEmail(emailValue);
        setIsLogging(true);
        try {
            console.log('Sending code to email:', emailValue);
            await sendCode({ email: emailValue, disableSignup: false });
            console.log('Email code sent successfully, current state:', emailState);
            setLoginMethod('otp');
            setIsLogging(false);
        } catch (error) {
            console.error('Failed to send email code:', error);
            trackLoginFailed('email', 'email_code_failed');
            setIsLogging(false);
        }
    };

    const handleOtpSubmit = async (code: string) => {
        if (!ready || code.length !== 6 || isLogging || emailState.status === 'submitting-code') return;

        // Prevent spam - limit attempts to once per 2 seconds
        const now = Date.now();
        if (now - lastFailedAttempt < 2000) {
            console.log('Rate limited: Please wait before trying again');
            return;
        }

        console.log('OTP code entered:', code);
        setIsLogging(true);
        setShouldClearOtp(false); // Reset clear flag

        try {
            console.log('Verifying OTP code...');
            await loginWithCode({ code });
            // Wallet creation will be handled by useEffect after authentication
            console.log('OTP verification successful');
        } catch (error) {
            console.error('Failed to verify OTP code:', error);
            trackLoginFailed('email', 'otp_verification_failed');
            setIsLogging(false);
            setLastFailedAttempt(now);
            setShouldClearOtp(true); // Trigger OTP clearing
        }
    };

    const handleResendCode = async () => {
        if (!email || emailState.status === 'sending-code') return;

        try {
            console.log('Resending code to email:', email);
            await sendCode({ email, disableSignup: false });
            console.log('Email code resent successfully');
        } catch (error) {
            console.error('Failed to resend email code:', error);
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
                        {!ready ? (
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
