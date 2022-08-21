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
import { fetchJokes, sendJoke, upvoteJoke } from "../clients/JokeClient";
import useApiStore from "../stores/useApiStore";


const JokeArena = ({}) => {
  const { useAnchor, useVersion } = useApiStore();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [jokes, setJokes] = useState([]);
  const anchorWallet = useAnchorWallet();


  const submitJoke = async (joke) => {
    await sendJoke({
      useVersion,
      useAnchor,
      connection,
      sendTransaction,
      anchorWallet,
      userPublicKey: publicKey,
      joke
    });
    await getAllJokes();
  };

  const getAllJokes = async () => {
    if (!connection) return;
    const jokes = await fetchJokes({
      useVersion,
      useAnchor,
      anchorWallet,
      connection
    });
    setJokes(jokes);
  };

  const onJokeClicked = async (event, key) => {
    const joke = jokes[key];
    await upvoteJoke({
      useVersion,
      useAnchor,
      connection,
      sendTransaction,
      anchorWallet,
      userPublicKey: publicKey,
      jokeAddress: joke.pubkey
    });
    await getAllJokes();
  }

  useEffect(() => {
    getAllJokes().catch(console.error);
  }, [publicKey, connection]);


  return (
    <div className="jokearena-container">
      <Intro />

      {connected &&
        jokes.map((item, idx) => (
          <div key={idx} className={"card"} onClick={event => onJokeClicked(event, idx)}>
            <div className="card-body">
              <div className="joke-author">
                <small className="txt-muted">
                  by @{item.author.toString()}
                </small>
              </div>
              <div className="joke-content">
                {item.content}
              </div>
              <hr />
              <div className="joke-votes">
                {item.votes} 👏
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
