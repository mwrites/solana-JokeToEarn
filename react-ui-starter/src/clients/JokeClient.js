import { sendJokeV1, upvoteJokeV1 } from "./native/v1/writeAccountsV1";
import { sendJokeV2, upvoteJokeV2 } from "./native/v2/writeAccountsV2";
import { anchor_fetchJokesV1, anchor_sendJokeV1, anchor_upvoteJokeV1 } from "./anchor/v1/anchorClientV1";
import { anchor_fetchJokesV2, anchor_sendJokeV2, anchor_upvoteJokeV2 } from "./anchor/v2/anchorClientV2";
import { getProgramAccountsWrapper } from "./native/getProgramAccountsWrapper";
import { JokeV1, JokeV2 } from "../models/Joke";
import useApiStore from "../stores/useApiStore";


// *************************************
// This file serve just to do the switch between v1 and v2,
// don't stress about it :) go directly see the clients/anchor and clients/native folders.
// *************************************
const fetchJokes = async ({
                            useAnchor,
                            useVersion,
                            connection,
                            anchorWallet
                          }) => {
  if (useAnchor) {
    const jokeModelVersions = { "v1": anchor_fetchJokesV1, "v2": anchor_fetchJokesV2 };
    return await jokeModelVersions[useVersion]({ anchorWallet, connection });
  } else {
    const jokeModelVersions = { "v1": JokeV1, "v2": JokeV2 };
    return await getProgramAccountsWrapper({
      connection,
      jokeModel: jokeModelVersions[useVersion]
    });
  }
};


const sendJoke = async ({
                          useAnchor,
                          useVersion,
                          connection,
                          sendTransaction,
                          anchorWallet,
                          userPublicKey,
                          joke
                        }) => {

  if (useAnchor) {
    const jokeModelVersions = { "v1": anchor_sendJokeV1, "v2": anchor_sendJokeV2 };
    await jokeModelVersions[useVersion]({ anchorWallet, connection, joke });
  } else {
    const jokeModelVersions = { "v1": sendJokeV1, "v2": sendJokeV2 };
    await jokeModelVersions[useVersion]({
      connection,
      sendTransaction,
      authorPubkey: userPublicKey,
      joke
    });
  }
};


const upvoteJoke = async ({
                            useAnchor,
                            useVersion,
                            connection,
                            sendTransaction,
                            anchorWallet,
                            userPublicKey,
                            jokeAddress,
                          }) => {

  if (useAnchor) {
    const jokeModelVersions = { "v1": anchor_upvoteJokeV1, "v2": anchor_upvoteJokeV2 };
    await jokeModelVersions[useVersion]({ anchorWallet, connection, jokeAddress });
  } else {
    const jokeModelVersions = { "v1": upvoteJokeV1, "v2": upvoteJokeV2 };
    await jokeModelVersions[useVersion]({
      connection,
      sendTransaction,
      voterPubkey: userPublicKey,
      jokeAddress
    });
  }
}


export {
  fetchJokes,
  sendJoke,
  upvoteJoke
};