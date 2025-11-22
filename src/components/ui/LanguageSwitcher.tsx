import { useState } from 'preact/hooks';
import { useTranslation } from '../../i18n';
import { trackLanguageChanged } from '../../utils/analytics';

export const LanguageSwitcher = () => {
    const { currentLanguage, setLanguage, availableLanguages, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageChange = (languageCode: string) => {
        if (languageCode !== currentLanguage) {
            trackLanguageChanged(languageCode);
        }
        setLanguage(languageCode as any);
        setIsOpen(false);
    };

    const currentLang = availableLanguages.find((lang) => lang.code === currentLanguage);

    return (
        <div class="relative">
            {/* Language Title */}
            <span class="text-[var(--color-shades-80)] font-['Sora'] font-semibold text-base block">
                {t('language.current')}
            </span>

            {/* Language Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                class="flex items-center justify-between w-full h-[72px] px-0 bg-transparent hover:bg-[var(--color-shades-20)] transition-colors duration-200 rounded-sm"
                type="button"
                aria-label={t('language.switch')}
                aria-expanded={isOpen}
            >
                <div class="flex items-center gap-4">
                    {/* Flag Container */}
                    <div class="w-[26px] h-[26px] bg-white rounded flex items-center justify-center">
                        <span class="text-lg">{currentLang?.flag}</span>
                    </div>
                    {/* Text Container */}
                    <div class="flex flex-col items-start">
                        <span class="text-white font-['Sora'] font-semibold text-base">{currentLang?.nativeName}</span>
                        <span class="text-[var(--color-shades-50)] font-['Sora'] font-semibold text-base">
                            {currentLang?.name}
                        </span>
                    </div>
                </div>
                {/* Arrow */}
                <svg
                    class={`w-6 h-6 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            </button>

            {/* Language Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div class="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />

                    {/* Dropdown Menu */}
                    <div class="absolute top-full left-0 mt-1 w-full bg-[var(--color-shades-10)] rounded-sm shadow-lg border border-[var(--color-shades-20)] z-20 overflow-hidden">
                        <div class="py-1">
                            {availableLanguages.map((language) => (
                                <button
                                    key={language.code}
                                    onClick={() => handleLanguageChange(language.code)}
                                    class={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-shades-20)] transition-colors duration-150 ${
                                        currentLanguage === language.code
                                            ? 'bg-[var(--color-cta)] text-white'
                                            : 'text-white'
                                    }`}
                                    type="button"
                                >
                                    <span class="text-lg">{language.flag}</span>
                                    <div class="flex-1">
                                        <div class="font-['Sora'] font-semibold text-base">{language.nativeName}</div>
                                        <div class="text-xs text-[var(--color-shades-50)] font-['Sora']">
                                            {language.name}
                                        </div>
                                    </div>
                                    {currentLanguage === language.code && (
                                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
