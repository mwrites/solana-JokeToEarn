import { PublicKey } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Provider } from '@project-serum/anchor';

export const connectionsOptions = Provider.defaultOptions()

export const programAddress = new PublicKey(
    'HZy4kyk53Zsrzgv84fuRmuXFNar9VAyJmqwVZtK1iEVy'
);

export const defaultCluster = "http://127.0.0.1:8899";