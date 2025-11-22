import { CDPReactProvider } from '@coinbase/cdp-react';
import type { ComponentChildren } from 'preact';

interface ClientProvidersProps {
    children: ComponentChildren;
}

const ClientProviders = ({ children }: ClientProvidersProps) => {
    return (
        <CDPReactProvider
            config={{
                projectId: import.meta.env.VITE_COINBASE_PROJECT_ID ?? '',
                ethereum: {
                    createOnLogin: 'eoa', // Automatically create EOA wallet on login
                },
                appName: 'Clink',
            }}
        >
            {children}
        </CDPReactProvider>
    );
};

export default ClientProviders;
