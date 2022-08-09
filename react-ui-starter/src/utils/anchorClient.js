import { Keypair, SystemProgram } from "@solana/web3.js";
import { Program, Provider } from "@project-serum/anchor";
import { programAddress, connectionsOptions } from "./config";
import Joke from "./Joke";
import * as BN from "bn.js";


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


const anchor_fetchJokes = async ({ wallet, connection }) => {
  const program = await getProgram(wallet, connection);

  // 1. Get accounts only with the created_at field instead of the full data
  const accounts = await connection.getProgramAccounts(programAddress, Joke.created_at_filter);
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
  // const accountsWithData = await connection.getMultipleAccountsInfo(pubkeysSortedByTimestamp);
  const accountsWithData = await program.account.joke.fetchMultiple(pubkeysSortedByTimestamp);

  // 4. AccountsWithData is not returning the addresses so we add this back into our Joke class
  let i = 0;
  return accountsWithData.map(({ author, createdAt, content }) => {
    let joke = new Joke(author, createdAt, content);
    joke.pubkey = pubkeysSortedByTimestamp[i++];
    return joke;
  });
};


const anchor_sendJoke = async ({ anchorWallet, connection, joke }) => {
  const program = await getProgram(anchorWallet, connection);
  const oneShotKeyForTheJoke = Keypair.generate();

  // Craft the createJoke Instruction
  await program.methods
    .createJoke(joke)
    .accounts({
      jokeAccount: oneShotKeyForTheJoke.publicKey,
      authority: anchorWallet.publicKey,
      systemProgram: SystemProgram.programId
    })
    .signers([oneShotKeyForTheJoke])
    .rpc();
};

export {
  anchor_fetchJokes, anchor_sendJoke
};
