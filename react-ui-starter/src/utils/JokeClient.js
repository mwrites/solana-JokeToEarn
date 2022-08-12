import { sendJokeV2 } from "./native/v2/writeAccountsV2";
import { sendJokeV3 } from "./native/v3/writeAccountsV3";
import { anchor_fetchJokesV2, anchor_sendJokeV2 } from "./anchor/v2/anchorClientV2";
import { anchor_fetchJokesV3, anchor_sendJokeV3 } from "./anchor/v3/anchorClientV3";
import { getProgramAccountsWrapper } from "./native/getProgramAccountsWrapper";
import { JokeV2, JokeV3 } from "./Joke";


const fetchJokes = async ({
                            programApiVersion,
                            useAnchor,
                            connection,
                            anchorWallet
                          }) => {
  if (useAnchor) {
    const jokeModelVersions = { "v2": anchor_fetchJokesV2, "v3": anchor_fetchJokesV3 };
    return await jokeModelVersions[programApiVersion]({ anchorWallet, connection });
  } else {
    const jokeModelVersions = { "v2": JokeV2, "v3": JokeV3 };
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
    const jokeModelVersions = { "v2": anchor_sendJokeV2, "v3": anchor_sendJokeV3 };
    await jokeModelVersions[programApiVersion]({ anchorWallet, connection, joke });
  } else {
    const jokeModelVersions = { "v2": sendJokeV2, "v3": sendJokeV3 };
    await jokeModelVersions[programApiVersion]({
      connection,
      sendTransaction,
      walletPublicKey,
      joke
    });
  }
};


export {
  fetchJokes,
  sendJoke
};