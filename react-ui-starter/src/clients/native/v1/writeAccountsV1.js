import { Keypair, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { programAddress } from "../../../utils/config";
import { createJokeInstruxBuffer } from "../instructionBuffer";


const sendJokeV1 = async ({ authorPubkey, connection, sendTransaction, joke }) => {
  await createJokeInstruction_OneShotKey_version({
    authorPubkey,
    connection,
    sendTransaction,
    joke
  });
};


// This works with v1 of the program where 1 joke = 1 ephemeral keypair
const createJokeInstruction_OneShotKey_version = async ({ connection, sendTransaction, authorPubkey, joke }) => {
  // 1. Create an address for the joke account
  const oneShotKeyForTheJoke = Keypair.generate();

  // Crafting Keys (see ../target/idl/joketoearn.json)
  const jokeAcc = { pubkey: oneShotKeyForTheJoke.publicKey, isSigner: true, isWritable: true};
  const author = { pubkey: authorPubkey, isSigner: true, isWritable: true };
  const sysPogram = { pubkey: SystemProgram.programId, isSigner: false, isWritable: false };
  const keys = [jokeAcc, author, sysPogram];

  // 2. Craft the create_joke Instruction
  const instruction = new TransactionInstruction({
    programId: programAddress,
    data: createJokeInstruxBuffer(joke, "v1"),
    keys: keys
  });

  // 3. Bundles the instruction into the transaction with the correct signers
  const transaction = new Transaction().add(instruction);
  const signers = [oneShotKeyForTheJoke];

  // 4. Shoot the transaction!
  const transactionSignature = await sendTransaction(transaction, connection, { signers });
  await connection.confirmTransaction(transactionSignature, "confirmed");
};

const upvoteJokeV1 = async ({ jokePublicKey, connection, sendTransaction }) => {
  alert("Voting doesn't work in v1! (broken on purpose lol) Please check v2")
};


export {
  sendJokeV1,
  upvoteJokeV1
};

