import { sendJokeV1 } from "./native/v1/writeAccountsV1";
import { sendJokeV2 } from "./native/v2/writeAccountsV2";
import { anchor_fetchJokesV1, anchor_sendJokeV1 } from "./anchor/v1/anchorClientV1";
import { anchor_fetchJokesV2, anchor_sendJokeV2 } from "./anchor/v2/anchorClientV2";
import { getProgramAccountsWrapper } from "./native/getProgramAccountsWrapper";
import { JokeV1, JokeV2 } from "../models/Joke";


const fetchJokes = async ({
                            programApiVersion,
                            useAnchor,
                            connection,
                            anchorWallet
                          }) => {
  if (useAnchor) {
    const jokeModelVersions = { "v1": anchor_fetchJokesV1, "v2": anchor_fetchJokesV2 };
    return await jokeModelVersions[programApiVersion]({ anchorWallet, connection });
  } else {
    const jokeModelVersions = { "v1": JokeV1, "v2": JokeV2 };
    return await getProgramAccountsWrapper({
      connection,
      jokeModel: jokeModelVersions[programApiVersion]
    });
  }
};


const sendJoke = async ({
                          programApiVersion,
                          useAnchor,
                          connection,
                          sendTransaction,
                          anchorWallet,
                          walletPublicKey,
                          joke
                        }) => {

  if (useAnchor) {
    const jokeModelVersions = { "v1": anchor_sendJokeV1, "v2": anchor_sendJokeV2 };
    await jokeModelVersions[programApiVersion]({ anchorWallet, connection, joke });
  } else {
    const jokeModelVersions = { "v1": sendJokeV1, "v2": sendJokeV2 };
    await jokeModelVersions[programApiVersion]({
      connection,
      sendTransaction,
      authorPubkey: walletPublicKey,
      joke
    });
  }
};


export {
  fetchJokes,
  sendJoke
};