import { useCallback, useState, useEffect } from 'preact/hooks';
import { useSnapshot } from 'valtio';
import { useT } from '../../i18n';
import { isValidUserTag, isOwnUserTag } from '../../utils/walletValidation';
import UserTagStore from '../../store/UserTagStore';
import { Background } from '../ui/Background';

interface ManualEntryProps {
    onAddressSubmit: (userTag: string) => void;
    onSwitchToScan: () => void;
}

export const ManualEntry = ({ onAddressSubmit, onSwitchToScan }: ManualEntryProps) => {
    const t = useT();
    const userTagState = useSnapshot(UserTagStore.state);
    const [recipientInput, setRecipientInput] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isPasting, setIsPasting] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Re-validate input when user tag finishes loading
    useEffect(() => {
        if (recipientInput && !userTagState.loading) {
            handleInputValidation(recipientInput);
        }
    }, [userTagState.loading]); // eslint-disable-line react-hooks/exhaustive-deps

    // Validate input (user tag only)
    const isValidInput = (input: string): boolean => {
        return isValidUserTag(input);
    };

    // Handle paste from clipboard
    const handlePaste = useCallback(async () => {
        try {
            setIsPasting(true);
            const text = await navigator.clipboard.readText();
            const upperText = text.toUpperCase(); // Convert to uppercase

            setRecipientInput(upperText);
            handleInputValidation(upperText);
        } catch (error) {
            console.error('Failed to read clipboard:', error);
            setValidationError(t('payment.manual.validation.clipboardError'));
        } finally {
            setIsPasting(false);
        }
    }, [t]);

    // Handle input validation (address or user tag)
    const handleInputValidation = (input: string) => {
        if (!input) {
            setValidationError(null);
            return;
        }

        // Wait for user tag to be loaded before validating user tags
        if (userTagState.loading) {
            setValidationError(t('payment.manual.validation.loading'));
            return;
        }

        // Validate user tag only
        if (!isValidUserTag(input)) {
            setValidationError(t('payment.manual.validation.invalid'));
            return;
        }

        // Check if user is trying to pay themselves
        if (userTagState.userTag && isOwnUserTag(input, userTagState.userTag)) {
            setValidationError(t('payment.manual.validation.selfPaymentTag'));
            return;
        }

        setValidationError(null);
    };

    const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const input = target.value.toUpperCase(); // Convert to uppercase

        setRecipientInput(input);
        handleInputValidation(input);
    };

    const handleSubmit = () => {
        if (isInputValid && recipientInput) {
            onAddressSubmit(recipientInput);
        }
    };

    const isInputValid = !validationError && recipientInput && isValidInput(recipientInput);

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden">
            <Background />
            <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={onSwitchToScan}
                        className="p-4 rounded-sm bg-[var(--color-shades-20)] backdrop-blur-sm flex items-center gap-2 text-white transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M19 12H5m0 0l7 7m-7-7l7-7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        {/* TODO: Uncomment the line below after finding a way to get backtracking */}
                        {/* {t('payment.qr.backToScan')} */}
                    </button>
                </div>

                {/* Content - centered in available space */}
                <div className="flex-1 flex flex-col items-center px-6">
                    {/* Recipient Input */}
                    <div className="w-full mt-6">
                        <div className="relative">
                            <div
                                className="relative bg-[var(--color-cta-5)] rounded-sm border border-[var(--color-cta-3)] transition-all duration-200"
                                style={{
                                    borderColor: validationError
                                        ? 'var(--color-cta)'
                                        : isInputValid
                                          ? 'var(--color-base-green)'
                                          : isFocused
                                            ? 'var(--color-cta)'
                                            : 'var(--color-cta-3)',
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder={t('payment.manual.inputPlaceholder')}
                                    value={recipientInput}
                                    onInput={handleInputChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    className="block w-full px-4 py-4 bg-transparent rounded-sm text-white font-['Sora'] font-semibold text-base pr-24 focus:outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={handlePaste}
                                    disabled={isPasting}
                                    className={`absolute inset-y-0 right-0 px-3 m-1 rounded-sm transition-all duration-200 flex items-center justify-center ${
                                        isPasting
                                            ? 'bg-[var(--color-cta-4)] text-[var(--color-shades-80)]'
                                            : 'bg-[var(--color-cta)] text-white hover:bg-[var(--color-cta-1)] active:bg-[var(--color-cta-2)]'
                                    }`}
                                >
                                    {isPasting ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                    )}
                                    <span className="text-sm font-['Sora'] font-semibold">
                                        {isPasting ? t('payment.manual.pasting') : t('payment.manual.pasteButton')}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Validation messages */}
                        <div className="min-h-[28px] mt-3">
                            {validationError ? (
                                <div className="flex items-center text-[var(--color-cta)] text-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>{validationError}</span>
                                </div>
                            ) : recipientInput && isInputValid ? (
                                <div className="flex items-center text-[var(--color-base-green)] text-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span>{t('payment.manual.validation.valid')}</span>
                                </div>
                            ) : null}
                        </div>

                        {/* User tag banner */}
                        <div
                            className="mt-6 p-4 rounded-xl flex items-start gap-3"
                            style="background: linear-gradient(90deg, #392E2C 0%, #000 100%);"
                        >
                            <div className="flex-1">
                                {/* Title row with info icon */}
                                <div className="flex items-center gap-1 mb-2">
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <svg
                                            width="25"
                                            height="24"
                                            viewBox="0 0 25 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                clip-rule="evenodd"
                                                d="M4.56284 11.9998C4.56284 7.42858 8.26854 3.72287 12.8398 3.72287C17.411 3.72287 21.1167 7.42858 21.1167 11.9998C21.1167 16.571 17.411 20.2767 12.8398 20.2767C8.26854 20.2767 4.56284 16.571 4.56284 11.9998ZM12.8398 2.34265C7.50627 2.34265 3.18262 6.6663 3.18262 11.9998C3.18262 17.3333 7.50627 21.6569 12.8398 21.6569C18.1733 21.6569 22.4969 17.3333 22.4969 11.9998C22.4969 6.6663 18.1733 2.34265 12.8398 2.34265Z"
                                                fill="#9F9290"
                                            />
                                            <path
                                                d="M13.3559 14.6641H12.3678C12.2874 14.6641 12.2208 14.6016 12.2156 14.5214L11.8147 7.94147C11.7962 7.65465 11.8944 7.38123 12.0909 7.17155C12.4831 6.75338 13.1955 6.75219 13.5889 7.16917C13.7854 7.37706 13.8844 7.64899 13.8679 7.93462L13.5081 14.5206C13.5035 14.601 13.4367 14.6641 13.3559 14.6641Z"
                                                fill="#9F9290"
                                            />
                                            <path
                                                d="M12.84 17.5016C12.3472 17.5016 11.9463 17.1007 11.9463 16.6081C11.9463 16.1151 12.3472 15.7142 12.84 15.7142C13.3326 15.7142 13.7335 16.1151 13.7335 16.6081C13.7335 17.1007 13.3326 17.5016 12.84 17.5016Z"
                                                fill="#9F9290"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-[var(--color-shades-100)] font-['Sora'] font-semibold text-sm">
                                        {t('payment.manual.userTagBanner.title')}
                                    </h3>
                                </div>

                                {/* Description */}
                                <p className="text-[var(--color-shades-60)] font-['Sora'] text-sm leading-relaxed">
                                    {t('payment.manual.userTagBanner.description')}
                                </p>
                            </div>
                            {/* User Icon */}
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center">
                                    <svg
                                        width="121"
                                        height="120"
                                        viewBox="0 0 121 120"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <mask
                                            id="mask0_274_5070"
                                            style="mask-type:alpha"
                                            maskUnits="userSpaceOnUse"
                                            x="-18"
                                            y="-22"
                                            width="168"
                                            height="163"
                                        >
                                            <ellipse
                                                cx="20.9018"
                                                cy="59.664"
                                                rx="64.1208"
                                                ry="92.6994"
                                                transform="rotate(42.5021 20.9018 59.664)"
                                                fill="#F9FFEF"
                                                filter="url(#maskBlur)"
                                            />
                                        </mask>
                                        <g mask="url(#mask0_274_5070)">
                                            <rect
                                                x="2.34961"
                                                y="1.85254"
                                                width="115.7"
                                                height="115.7"
                                                rx="31.5545"
                                                fill="#B6F24E"
                                                fill-opacity="0.25"
                                            />
                                            <rect
                                                x="3.34961"
                                                y="2.85254"
                                                width="113.7"
                                                height="113.7"
                                                rx="30.5545"
                                                stroke="url(#paint0_linear_274_5070)"
                                                stroke-opacity="0.4"
                                                stroke-width="2"
                                            />
                                            <path
                                                fill-rule="evenodd"
                                                clip-rule="evenodd"
                                                d="M55.8831 57.7307C47.1087 59.4775 41.82 66.7759 39.9583 78.1972C39.1525 83.2324 49.001 85.2465 60.1927 85.2465C71.3844 85.2465 81.2331 83.2324 80.4273 78.1972C78.5653 66.8533 73.275 59.4962 64.4979 57.7341C63.1465 57.4628 61.7125 57.3241 60.1955 57.3239C58.6759 57.3239 57.2367 57.4613 55.8831 57.7307ZM56.2266 54.213C57.4458 54.7397 58.786 55.0311 60.1927 55.0315C61.5981 55.0315 62.9399 54.741 64.1583 54.2157C67.8271 52.6338 70.4023 48.9218 70.4023 44.5948C70.4023 38.8308 65.8326 34.1582 60.1955 34.1582C54.5584 34.1582 49.9887 38.8308 49.9887 44.5948C49.9887 48.9194 52.5611 52.6297 56.2266 54.213ZM77.0613 78.7177C76.0521 72.5956 74.0346 68.1059 71.2872 65.1846C68.6168 62.3452 65.0214 60.7298 60.1927 60.7298C55.3524 60.7298 51.7589 62.3303 49.0946 65.1542C46.3522 68.0608 44.334 72.5466 43.3243 78.7177C43.3521 78.7556 43.4051 78.8188 43.4994 78.9048C43.9403 79.3062 44.8872 79.8453 46.559 80.349C49.8517 81.341 54.7266 81.8406 60.1927 81.8406C65.6588 81.8406 70.5337 81.341 73.8266 80.3489C75.4984 79.8453 76.4453 79.3062 76.8862 78.9047C76.9805 78.8188 77.0335 78.7556 77.0613 78.7177ZM60.1955 51.6256C63.8805 51.6256 66.9965 48.5497 66.9965 44.5948C66.9965 40.64 63.8805 37.5641 60.1955 37.5641C56.5105 37.5641 53.3946 40.64 53.3946 44.5948C53.3946 48.5497 56.5105 51.6256 60.1955 51.6256Z"
                                                fill="#B6F24E"
                                            />
                                            <path
                                                d="M60.1953 59.3242C61.5903 59.3244 62.8923 59.4519 64.1045 59.6953C71.7263 61.2257 76.6579 67.5937 78.4521 78.5127V78.5137C78.5273 78.984 78.4183 79.4113 77.833 79.9443C77.1676 80.5503 75.9902 81.1657 74.2324 81.6953C70.7466 82.7455 65.712 83.2461 60.1924 83.2461C54.6729 83.2461 49.639 82.7455 46.1533 81.6953C44.3955 81.1657 43.2181 80.5503 42.5527 79.9443C41.9673 79.4112 41.8573 78.9832 41.9326 78.5127C43.7261 67.5187 48.6549 61.2091 56.2734 59.6924C57.3363 59.4808 58.4706 59.3576 59.6748 59.3301L60.1953 59.3242ZM60.1953 36.1582C64.686 36.1582 68.4023 39.8931 68.4023 44.5947C68.4023 48.1151 66.3093 51.1099 63.3662 52.3789C62.393 52.7985 61.3201 53.0303 60.1924 53.0303C59.0645 53.0298 57.9937 52.7978 57.0195 52.377C54.0791 51.1067 51.9883 48.1131 51.9883 44.5947C51.9883 39.8932 55.7047 36.1583 60.1953 36.1582Z"
                                                fill="#B6F24E"
                                                stroke="url(#paint1_linear_274_5070)"
                                                stroke-width="4"
                                                stroke-linejoin="round"
                                            />
                                        </g>
                                        <defs>
                                            <filter
                                                id="maskBlur"
                                                x="-50%"
                                                y="-50%"
                                                width="200%"
                                                height="200%"
                                                filterUnits="objectBoundingBox"
                                            >
                                                <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
                                            </filter>
                                            <linearGradient
                                                id="paint0_linear_274_5070"
                                                x1="-7.71081"
                                                y1="-7.31749"
                                                x2="71.5444"
                                                y2="78.4878"
                                                gradientUnits="userSpaceOnUse"
                                            >
                                                <stop stop-color="#B6F24E" />
                                                <stop offset="1" stop-color="#698C2D" stop-opacity="0" />
                                            </linearGradient>
                                            <linearGradient
                                                id="paint1_linear_274_5070"
                                                x1="39.4464"
                                                y1="50.3228"
                                                x2="60.4065"
                                                y2="64.7328"
                                                gradientUnits="userSpaceOnUse"
                                            >
                                                <stop stop-color="#F9FFEF" />
                                                <stop offset="1" stop-color="#E1FFAE" stop-opacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Continue Button */}
                <div className="flex-shrink-0">
                    <div className="px-6 pb-6">
                        <button
                            onClick={handleSubmit}
                            disabled={!isInputValid}
                            className={`w-full py-4 rounded-sm transition-all duration-200 text-lg font-['Sora'] font-semibold ${
                                isInputValid
                                    ? 'bg-[var(--color-cta)] text-white hover:bg-[var(--color-cta-1)] active:bg-[var(--color-cta-2)]'
                                    : 'bg-[var(--color-cta-4)] text-[var(--color-shades-70)] cursor-not-allowed'
                            }`}
                        >
                            {t('payment.manual.continueButton')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
