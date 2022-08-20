import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { programAddress } from "../../../utils/config";
import { Buffer } from "buffer";
import { createJokeInstruxBuffer } from "../instructionBuffer";


const sendJokeV2 = async ({ authorPubkey, connection, sendTransaction, joke }) => {
  await createJokeInstruction_PDA_version({
    authorPubkey,
    connection,
    sendTransaction,
    joke
  });
};


//  This works with v2 of the program where 1 joke = 1 pda with the 👇 seeds
const createJokeInstruction_PDA_version = async ({ connection, sendTransaction, authorPubkey, joke }) => {
  // Crafting PDA
  // Create an identifier for the joke
  const jokeId = Keypair.generate().publicKey;
  const seeds = [
    Buffer.from("joke"),
    authorPubkey.toBuffer(),
    jokeId.toBuffer()
  ];
  const [jokeAddress, _] = await PublicKey.findProgramAddress(seeds, programAddress);

  // Crafting Keys (see ../target/idl/joketoearn.json)
  const jokeIdKey = { pubkey: jokeId, isSigner: false, isWritable: false };
  const jokeAccKey = { pubkey: jokeAddress, isSigner: false, isWritable: true };
  const jokeAuthorKey = { pubkey: authorPubkey, isSigner: true, isWritable: true };
  const sysProgramKey =  { pubkey: SystemProgram.programId, isSigner: false, isWritable: false };
  const keys = [jokeIdKey, jokeAccKey, jokeAuthorKey, sysProgramKey];

  // Crafting Transaction
  const instruction = new TransactionInstruction({
    programId: programAddress,
    data: createJokeInstruxBuffer(joke, "v2"),
    keys: keys
  });

  // 4. Bundles the instruction into the transaction with the correct signers
  // looking at the keys 👆 the only signer here is the wallet which is already injected by wallet adapter
  const transaction = new Transaction().add(instruction);
  const signers = [];

  // 5. Shoot the transaction!
  const transactionSignature = await sendTransaction(transaction, connection, { signers });
  await connection.confirmTransaction(transactionSignature, "confirmed");
};


const upvoteJoke = async ({ jokePublicKey, connection, sendTransaction }) => {

};


export {
  sendJokeV2,
  upvoteJoke
};

