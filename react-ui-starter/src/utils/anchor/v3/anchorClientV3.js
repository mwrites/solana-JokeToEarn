import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, Provider } from "@project-serum/anchor";
import { programAddress, connectionsOptions } from "../../config";
import { JokeV3 } from "../../Joke";
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


const anchor_fetchJokesV3 = async ({ anchorWallet, connection }) => {

  // 1. Get accounts only with the created_at field instead of the full data
  const jokev3 = new JokeV3();
  const accounts = await connection.getProgramAccounts(programAddress, jokev3.created_at_filter);
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
  const accountsWithData = await program.account.jokeV3.fetchMultiple(pubkeysSortedByTimestamp);

  // 4. AccountsWithData is not returning the addresses, so we add this back into our Joke class
  let i = 0;
  return accountsWithData.map(({ author, createdAt, votes, content }) => {
    let joke = new JokeV3();
    joke.author = author;
    joke.created_at = createdAt;
    joke.votes = votes,
      joke.content = content;
    joke.pubkey = pubkeysSortedByTimestamp[i++];
    return joke;
  });
};


const anchor_sendJokeV3 = async ({ anchorWallet, connection, joke }) => {
  const program = await getProgram(anchorWallet, connection);
  await anchor_createJokeInstruction_PDA_version({ program, anchorWallet, joke });
};


//  This works with v3 of the program where 1 joke = 1 pda with the 👇 seeds
const anchor_createJokeInstruction_PDA_version = async ({ program, anchorWallet, joke }) => {
  const jokePda = async (jokePubkey, jokeId) => {
    const seeds = [Buffer.from("joke"), jokePubkey.toBuffer(), jokeId.toBuffer()];
    return await PublicKey.findProgramAddress(
      seeds,
      programAddress
    );
  };

  // TODO: passing a keypair because dunno how to pass uid to anchor
  // 1. Create an identifier for the joke
  const jokeId = Keypair.generate().publicKey;

  // 2. Generate a PDA with the correct seeds
  const [pda, _] = await jokePda(anchorWallet.publicKey, jokeId);

  // 3. Craft the createJoke Instruction
  const tx = await program.methods
    .createJokeV3(joke)
    .accounts({
      jokeId: jokeId,
      payer: anchorWallet.publicKey,
      jokePda: pda,
      systemProgram: SystemProgram.programId
    })
    .rpc();

  await program.provider.connection.confirmTransaction(tx, "confirmed");
};


export {
  anchor_fetchJokesV3,
  anchor_sendJokeV3
};
