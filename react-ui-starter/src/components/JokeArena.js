// React Stuff
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";


// My Deps
import Intro from './Intro';
import JokeEditor from './JokeEditor';
import { fetchJokes, sendJoke } from "../utils/anchorClient"



const JokeArena = ({ network }) => {
    const wallet = useWallet();
    const [jokes, setJokes] = useState([]);

    const submitJoke = async (joke) => {
        await sendJoke(wallet, network, joke);
        await getAllJokes()
    }

    const getAllJokes = async () => {
        const jokes = await fetchJokes(wallet, network);
        setJokes(jokes.flatMap(joke => joke.account));
    }

    useEffect(() => {
        getAllJokes();
    }, [network, wallet]);

    return (
        <div className="jokearena-container">
            <Intro wallet={wallet}/>

            { wallet.connected &&
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
            <JokeEditor wallet={wallet} submitJoke={submitJoke} />
        </div>
    )
}

export default JokeArena;
