// React Stuff
import React, { useEffect, useState } from "react";
import {
  // uncomment for anchor version
  useAnchorWallet,
  useConnection,
  useWallet
} from "@solana/wallet-adapter-react";


// My Deps
import Intro from "./Intro";
import JokeEditor from "./JokeEditor";
import { fetchJokes, sendJoke } from "../clients/JokeClient";
import { defaultApiVersion, defaultUseAnchor } from "../utils/config";

const programApiVersion = defaultApiVersion;
const useAnchor = defaultUseAnchor;


const JokeArena = ({}) => {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [jokes, setJokes] = useState([]);
  const anchorWallet = useAnchorWallet();


  const submitJoke = async (joke) => {
    await sendJoke({
      programApiVersion,
      useAnchor,
      connection,
      sendTransaction,
      anchorWallet,
      walletPublicKey: publicKey,
      joke
    });
    await getAllJokes();
  };

  const getAllJokes = async () => {
    if (!connection) return;
    const jokes = await fetchJokes({
      programApiVersion,
      useAnchor,
      anchorWallet,
      connection
    });
    setJokes(jokes);
  };

  useEffect(() => {
    getAllJokes().catch(console.error);
  }, [publicKey, connection]);


  return (
    <div className="jokearena-container">
      <Intro />

      {connected &&
        jokes.map((item, idx) => (
          <div key={idx} className={"card"}>
            <div className={"card-body"}>
              <div className={"joke-author"}>
                <small className="txt-muted">
                  by @{item.author.toString()}
                </small>
              </div>
              <div className={"joke-content"}>
                {item.content}
              </div>
            </div>
          </div>
        ))
      }
      <JokeEditor submitJoke={submitJoke} />
    </div>
  );
};

export default JokeArena;
