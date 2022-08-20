// React Stuff
import React, { useMemo } from 'react';

// Wallet-Adapter Stuff
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css'

// Solana Stuff
import JokeArena from './components/JokeArena';
import { defaultCluster } from './utils/config';
import { ClientSelector } from "./components/ClientSelector";



const App = () => {
    const endpoint = useMemo(() => defaultCluster, [defaultCluster]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ endpoint }),
            new SolletExtensionWalletAdapter({ endpoint }),
        ],
        [endpoint]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <ClientSelector />
                    <JokeArena />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default App;