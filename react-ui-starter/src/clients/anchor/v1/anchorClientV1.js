import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, Provider } from "@project-serum/anchor";
import { programAddress, connectionsOptions } from "../../../utils/config";
import { JokeV1 } from "../../../models/Joke";
import * as BN from "bn.js";
import { Buffer } from "buffer";


const getConnectionProvider = async (wallet, connection) => {
  return new Provider(connection, wallet, connectionsOptions);
};


const getProgram = async (wallet, connection) => {
  // Get a connection
  const provider = await getConnectionProvider(wallet, connection);
  // Get metadata about your solana program
  const idl = await Program.fetchIdl(programAddress, provider);
  // Create a program that you can call
  return new Program(idl, programAddress, provider);
};


const anchor_fetchJokesV1 = async ({ anchorWallet, connection }) => {
  // 1. Get accounts only with the created_at field instead of the full data
  const jokev1 = new JokeV1();
  const accounts = await connection.getProgramAccounts(programAddress, jokev1.created_at_filter);
  // const accounts = program.account.joke.all(Joke.created_at_filter);

  // 2. Sort the addresses by created_at field
  const accountsWithTimestamp = accounts.map(({ pubkey, account }) => ({
    pubkey, created_at: new BN(account.data, "le")
  }));
  const pubkeysSortedByTimestamp = accountsWithTimestamp.sort((a, b) => b.created_at.cmp(a.created_at)).map(({
                                                                                                               pubkey,
                                                                                                               _
                                                                                                             }) => (pubkey));

  // 3. Now we have these addresses sorted we can give this sorted collection to fetchMultiple (getMultipleAccountsInfo)
  const program = await getProgram(anchorWallet, connection);
  const accountsWithData = await program.account.jokeV1.fetchMultiple(pubkeysSortedByTimestamp);

  // 4. AccountsWithData is not returning the addresses so we add this back into our Joke class
  let i = 0;
  return accountsWithData.map(({ author, createdAt, content }) => {
    let joke = new JokeV1();
    joke.author = author;
    joke.created_at = createdAt;
    joke.content = content;
    joke.pubkey = pubkeysSortedByTimestamp[i++];
    return joke;
  });
};


const anchor_sendJokeV1 = async ({ anchorWallet, connection, joke }) => {
  const program = await getProgram(anchorWallet, connection);
  await anchor_createJokeInstruction_OneShotKey_version({ program, anchorWallet, joke });
};


// This works with v1 of the program where 1 joke = 1 ephemeral keypair
const anchor_createJokeInstruction_OneShotKey_version = async ({ program, anchorWallet, joke }) => {
  const oneShotKeyForTheJoke = Keypair.generate();

  // Craft the createJoke Instruction
  const tx = await program.methods
    .createJokeV1(joke)
    .accounts({
      jokeAccount: oneShotKeyForTheJoke.publicKey,
      author: anchorWallet.publicKey,
      systemProgram: SystemProgram.programId
    })
    .signers([oneShotKeyForTheJoke])
    .rpc();

  await program.provider.connection.confirmTransaction(tx, "confirmed");
};


export {
  anchor_fetchJokesV1,
  anchor_sendJokeV1
};
