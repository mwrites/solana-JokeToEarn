import {
  Keypair,
  SystemProgram,
  Transaction, TransactionInstruction
} from "@solana/web3.js";
import { programAddress } from "./config";
import { Buffer } from "buffer";
import { sha256 } from "js-sha256";
import * as BN from "bn.js";
import Joke from "./Joke";


const fetchJokes = async ({ wallet, connection }) => {
  // 1. Get accounts only with the created_at field instead of the full data
  const accounts = await connection.getProgramAccounts(programAddress, Joke.created_at_filter);

  // 2. Sort the addresses by created_at field
  const accountsWithTimestamp = accounts.map(({ pubkey, account }) => ({
    pubkey, created_at: new BN(account.data, "le")
  }));
  const pubkeysSortedByTimestamp = accountsWithTimestamp.sort((a, b) => b.created_at.cmp(a.created_at)).map(({ pubkey }) => (pubkey));

  // 3. Now we have these addresses sorted we can give this sorted collection to fetchMultiple (getMultipleAccountsInfo)
  const accountsWithData = await connection.getMultipleAccountsInfo(pubkeysSortedByTimestamp);

  // 4. AccountsWithData is not returning the addresses so we add this back into our Joke class
  let i = 0;
  return accountsWithData.map(({ data }) => {
    const joke = Joke.initFromDeserialization(data);
    joke.pubkey = pubkeysSortedByTimestamp[i++];
    return joke;
  });
};


const sendJoke = async ({walletPublicKey, connection, sendTransaction, joke}) => {
  const oneShotKeyForTheJoke = Keypair.generate();

  // Craft the createJokeInstruction
  const sendJokeInstrux = new TransactionInstruction({
    programId: programAddress,
    data: createJokeInstruxBuffer(joke),
    keys: [
      { pubkey: oneShotKeyForTheJoke.publicKey, isSigner: true, isWritable: true },
      { pubkey: walletPublicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ]
  });

  // Send Transaction
  const transaction = new Transaction().add(sendJokeInstrux);
  const signers = [oneShotKeyForTheJoke];
  const transactionSignature = await sendTransaction(transaction, connection, { signers });
  await connection.confirmTransaction(transactionSignature, "confirmed");
};


const upvoteJoke = async (wallet, network, jokePubkey) => {

};


export {
  fetchJokes,
  sendJoke,
  upvoteJoke
};

//region Do not use
// No reason for anyone to use the below code,
// it's just a hack for the sake of not using anchor code with an anchor program
// https://solana.stackexchange.com/questions/1833/how-to-serialize-instruction-buffer-for-an-anchor-program
//
// -> If you are using js just use the typescript lib @project-serum/anchor
//
const createJokeInstruxBuffer = (joke) => {
  const anchorName = "global" + ":" + "create_joke";
  const ixSigHash = Buffer.from(sha256.digest(anchorName)).slice(0, 8);

  const string_u8vec = new TextEncoder().encode(joke);
  const string_u8vec_length = Buffer.from(new Uint8Array(new BN(string_u8vec.length).toArray("le", 4)));
  return Buffer.concat([ixSigHash, string_u8vec_length, string_u8vec]);
};
//endregion