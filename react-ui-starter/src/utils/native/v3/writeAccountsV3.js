import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { programAddress } from "../../config";
import { Buffer } from "buffer";
import { createJokeInstruxBuffer } from "../instructionBuffer";


const sendJokeV3 = async ({walletPublicKey, connection, sendTransaction, joke}) => {
  await createJokeInstruction_PDA_version({
    walletPublicKey,
    connection,
    sendTransaction,
    joke
  });
};


//  This works with v3 of the program where 1 joke = 1 pda with the 👇 seeds
const createJokeInstruction_PDA_version = async ({connection, sendTransaction, walletPublicKey, joke}) => {
  const jokePda = async (jokePubkey, jokeId) => {
    const seeds = [Buffer.from('joke'), jokePubkey.toBuffer(), jokeId.toBuffer()]
    return await PublicKey.findProgramAddress(
      seeds,
      programAddress
    );
  };

  // TODO: passing a keypair because dunno how to pass uid to anchor
  // 1. Create an identifier for the joke
  const jokeId = Keypair.generate().publicKey;

  // 2. Generate a PDA with the correct seeds
  const [ pda, _ ] = await jokePda(walletPublicKey, jokeId);

  // 3. Craft the create_joke Instruction
  const instruction = new TransactionInstruction({
    programId: programAddress,
    data: createJokeInstruxBuffer(joke),
    keys: [
      { pubkey: jokeId, isSigner: false, isWritable: false },
      { pubkey: walletPublicKey, isSigner: true, isWritable: true },
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ]
  });

  // 4. Bundles the instruction into the transaction with the correct signers
  // looking at the keys 👆 the only signer here is the wallet which is already injected by wallet adapter
  const transaction = new Transaction().add(instruction);
  const signers = [];

  // 5. Shoot the transaction!
  const transactionSignature = await sendTransaction(transaction, connection, { signers });
  await connection.confirmTransaction(transactionSignature, "confirmed");
};


const upvoteJoke = async ({jokePublicKey, connection, sendTransaction }) => {

};


export {
  sendJokeV3,
  upvoteJoke
};

