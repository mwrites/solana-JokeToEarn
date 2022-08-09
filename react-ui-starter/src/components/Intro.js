import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from "@solana/wallet-adapter-react";



const Intro = ({ }) => {
  const { connected } = useWallet();

    return (
        <div className="intro-container">
            <h1 className={"header"}>🎙 + 😆 = JokeToEarn</h1>
            <h3 className={"intro"}>Enter the wild joke arena 🍩, tell a joke and earn some sol!</h3>
            <WalletMultiButton className={"btn-wallet"} />
            { !connected &&
                <div className={"help"}>
                    <h3>Please start by connecting your Wallet On DevNet :)</h3>
                    <p>
                        No Wallet? <a className={"txt-white"} href="https://phantom.app">Get One Here</a>
                    </p>
                </div>
            }
        </div>
    )
}

export default Intro;
