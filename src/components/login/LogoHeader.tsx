import { useState } from 'preact/hooks';
import logo from '/logo.png';

export const LogoHeader = () => {
    const [isLogoLoaded, setIsLogoLoaded] = useState(false);

    return (
        <div className="relative flex flex-col justify-center items-center mt-30 h-[460px]">
            <img
                src={logo}
                alt="Clink"
                width={226}
                onLoad={() => setIsLogoLoaded(true)}
                className={`relative z-10 ${isLogoLoaded ? 'loaded' : ''}`}
            />
            <h1 class="flex w-full justify-center font-semibold text-4xl bg-transparent">Clink</h1>
        </div>
    );
};
