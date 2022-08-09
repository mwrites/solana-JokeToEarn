// React Stuff
import React, { useEffect, useState } from "react";
import {
    // uncomment for anchor version
    // useAnchorWallet,
    useConnection,
    useWallet
} from "@solana/wallet-adapter-react";


// My Deps
import Intro from './Intro';
import JokeEditor from './JokeEditor';
import { fetchJokes, sendJoke } from "../utils/client"
// uncomment for anchor version
// import { anchor_fetchJokes, anchor_sendJoke } from "../utils/anchorClient";



const JokeArena = ({ }) => {
    const { connection } = useConnection();
    const { wallet, publicKey, connected, sendTransaction } = useWallet();
    // uncomment for anchor version
    // const anchorWallet = useAnchorWallet();
    const [jokes, setJokes] = useState([]);

    const submitJoke = async (joke) => {
        // uncomment to use anchor libs
        // await anchor_sendJoke({anchorWallet,
        //     walletPubkey: publicKey,
        //     connection,
        //     sendTransaction,
        //     joke
        // });
        await sendJoke({
            walletPublicKey: publicKey,
            connection,
            sendTransaction,
            joke
        })
        await getAllJokes()
    }

    const getAllJokes = async () => {
        if (!connection) return;
        const jokes = await fetchJokes({wallet: wallet, connection});
        setJokes(jokes);
    }

    useEffect(() => {
        getAllJokes();
    }, [publicKey, connection]);

    return (
        <div className="jokearena-container">
            <Intro />

            { connected &&
                jokes.map((item, idx) => (
                    <div key={idx} className={"card"}>
                        <div className={"card-body"}>
                            <div className={"joke-author"}>
                                <small className="txt-muted">
                                    by @{ item.author.toString()}
                                </small>
                            </div>
                            <div className={"joke-content"}>
                                { item.content }
                            </div>
                        </div>
                    </div>
                ))
            }
            <JokeEditor submitJoke={submitJoke} />
        </div>
    )
}

export default JokeArena;
