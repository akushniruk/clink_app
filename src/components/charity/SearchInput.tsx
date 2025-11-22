import { useCallback } from 'preact/hooks';

interface SearchInputProps {
    value: string;
    onInput: (value: string) => void;
    placeholder?: string;
}

export const SearchInput = ({ value, onInput, placeholder = 'Search...' }: SearchInputProps) => {
    const handleInput = useCallback(
        (e: Event) => {
            onInput((e.target as HTMLInputElement).value);
        },
        [onInput],
    );

    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onInput={handleInput}
            className="w-full px-4 py-3 bg-[var(--color-shades-10)] border border-[var(--color-shades-30)] rounded-xl text-[var(--color-shades-100)] placeholder-[var(--color-shades-60)] focus:outline-none focus:border-[var(--color-cta)] transition-colors"
        />
    );
};
