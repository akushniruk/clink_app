import { lazy, Suspense } from 'preact/compat';
import { Background } from '../ui/Background';

// Lazy load payment flow pages
const EnterAmountPage = lazy(() => import('../../pages/EnterAmountPage').then((m) => ({ default: m.EnterAmountPage })));
const ConfirmationPage = lazy(() =>
    import('../../pages/ConfirmationPage').then((m) => ({ default: m.ConfirmationPage })),
);
const SuccessPage = lazy(() => import('../../pages/SuccessPage').then((m) => ({ default: m.SuccessPage })));
const FailurePage = lazy(() => import('../../pages/FailurePage').then((m) => ({ default: m.FailurePage })));

export type PaymentFlowView = 'amount' | 'confirmation' | 'success' | 'failure';

export interface PaymentFlowRouterProps {
    currentView: PaymentFlowView;
    recipientAddress: string;
    paymentAmount: string;
    transactionId: string;
    errorMessage: string;
    onBackToAmount: () => void;
    onBackToPrevious: () => void;
    onAmountComplete: (amount: string) => void;
    onConfirmPayment: () => void;
    onRetryPayment: () => void;
    onCancelPayment: () => void;
    onPaymentSuccess: () => void;
    loadingFallback?: React.ReactNode;
    customPages?: {
        [K in PaymentFlowView]?: React.ReactNode;
    };
}

const DefaultLoadingFallback = (): React.ReactNode => (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center">
        <div className="text-white text-center">
            <p>Loading...</p>
            <div className="w-8 h-8 border-2 border-[var(--color-cta)] border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </div>
    </div>
);

export const PaymentFlowRouter = ({
    currentView,
    recipientAddress,
    paymentAmount,
    transactionId,
    errorMessage,
    onBackToAmount,
    onBackToPrevious,
    onAmountComplete,
    onConfirmPayment,
    onRetryPayment,
    onCancelPayment,
    onPaymentSuccess,
    loadingFallback = <DefaultLoadingFallback />,
    customPages = {},
}: PaymentFlowRouterProps): React.ReactNode => {
    // Return custom page if provided
    if (customPages[currentView]) {
        return customPages[currentView]!;
    }

    const renderPage = () => {
        switch (currentView) {
            case 'amount':
                return (
                    <EnterAmountPage
                        recipientAddress={recipientAddress}
                        onBack={onBackToPrevious}
                        onComplete={onAmountComplete}
                    />
                );

            case 'confirmation':
                return (
                    <ConfirmationPage
                        recipientAddress={recipientAddress}
                        amount={paymentAmount}
                        onBack={onBackToAmount}
                        onConfirm={onConfirmPayment}
                    />
                );

            case 'success':
                return (
                    <SuccessPage
                        recipientAddress={recipientAddress}
                        amount={paymentAmount}
                        transactionId={transactionId}
                        onDone={onPaymentSuccess}
                    />
                );

            case 'failure':
                return (
                    <FailurePage
                        recipientAddress={recipientAddress}
                        amount={paymentAmount}
                        errorMessage={errorMessage}
                        onRetry={onRetryPayment}
                        onCancel={onCancelPayment}
                    />
                );

            default:
                return null;
        }
    };

    return <Suspense fallback={loadingFallback}>{renderPage()}</Suspense>;
};

// Utility component for consistent loading states
export const PaymentFlowLoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
        <Background />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
            <div className="text-center">
                <p className="text-white text-lg mb-4">{message}</p>
                <div className="w-8 h-8 border-2 border-[var(--color-cta)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        </div>
    </div>
);
