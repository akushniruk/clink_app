import { useState } from 'preact/hooks';
import { useTranslation } from '../../i18n/useTranslation';
import { useYellowWebSocketContext } from './YellowWebSocketProvider';
import { Button } from '../ui';

interface AuthChallengeButtonProps {
    className?: string;
}

export const AuthChallengeButton = ({ className = '' }: AuthChallengeButtonProps) => {
    const { t } = useTranslation();
    const yellowWS = useYellowWebSocketContext();
    const [isProcessing, setIsProcessing] = useState(false);

    // The challenge will be triggered by actual WebSocket auth_challenge messages
    // No need to auto-trigger fake challenges

    const handleApprove = async () => {
        if (!yellowWS.client || !yellowWS.client.hasPendingChallenge) {
            return;
        }

        setIsProcessing(true);
        try {
            await yellowWS.client.approveChallenge();
        } catch (error) {
            console.error('Challenge approval failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error details:', errorMessage);
            // Show user-friendly error
            alert(`Authentication failed: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Show different buttons based on status
    if (yellowWS.status === 'pending_auth' && yellowWS.client?.hasPendingChallenge) {
        return (
            <Button
                onClick={handleApprove}
                disabled={isProcessing}
                variant="primary"
                size="lg"
                fullWidth
                className={className}
            >
                {isProcessing ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {t('auth.challenge.processing')}
                    </>
                ) : (
                    t('auth.challenge.approve')
                )}
            </Button>
        );
    }

    // Show connecting status or error
    if (yellowWS.status === 'connecting') {
        return (
            <Button disabled variant="primary" size="lg" fullWidth className={className}>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Connecting to Yellow...
            </Button>
        );
    }

    if (yellowWS.error) {
        return (
            <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                size="lg"
                fullWidth
                className={className}
            >
                Retry Connection
            </Button>
        );
    }

    // No pending challenge, likely waiting for connection
    return (
        <Button disabled variant="primary" size="lg" fullWidth className={className}>
            Waiting for Yellow connection...
        </Button>
    );
};
