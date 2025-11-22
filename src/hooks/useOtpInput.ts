import { useState } from 'preact/hooks';

export const useOtpInput = (length: number = 6) => {
    const [otpCode, setOtpCode] = useState<string[]>(new Array(length).fill(''));

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtpCode = [...otpCode];
        newOtpCode[index] = value.slice(-1); // Only take the last digit
        setOtpCode(newOtpCode);

        // Auto-focus next input
        if (value && index < length - 1) {
            const nextInput = document.querySelector(`input[name="code-${index + 1}"]`) as HTMLInputElement;
            if (nextInput) nextInput.focus();
        }

        return newOtpCode;
    };

    const handleOtpPaste = (e: ClipboardEvent, index: number) => {
        e.preventDefault();
        const pastedData = e.clipboardData?.getData('text') || '';
        const digits = pastedData.replace(/\D/g, '').slice(0, length); // Only keep digits, max length

        if (digits.length === 0) return;

        const newOtpCode = [...otpCode];

        // Fill from current index
        for (let i = 0; i < digits.length && index + i < length; i++) {
            newOtpCode[index + i] = digits[i];
        }

        setOtpCode(newOtpCode);

        // Focus the next empty field or last field if all filled
        const nextEmptyIndex = newOtpCode.findIndex((digit) => digit === '');
        const targetIndex = nextEmptyIndex === -1 ? length - 1 : Math.min(nextEmptyIndex, length - 1);

        setTimeout(() => {
            const targetInput = document.querySelector(`input[name="code-${targetIndex}"]`) as HTMLInputElement;
            if (targetInput) targetInput.focus();
        }, 10);

        return newOtpCode;
    };

    const handleBackspace = (index: number, digit: string) => {
        if (!digit && index > 0) {
            const prevInput = document.querySelector(`input[name="code-${index - 1}"]`) as HTMLInputElement;
            if (prevInput) prevInput.focus();
        }
    };

    const resetOtp = () => {
        setOtpCode(new Array(length).fill(''));
    };

    const isComplete = () => {
        return otpCode.every((digit) => digit !== '') && otpCode.join('').length === length;
    };

    const getCode = () => {
        return otpCode.join('');
    };

    return {
        otpCode,
        handleOtpChange,
        handleOtpPaste,
        handleBackspace,
        resetOtp,
        isComplete,
        getCode,
        setOtpCode,
    };
};
