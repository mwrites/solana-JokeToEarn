import { Keypair, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { programAddress } from "../../../utils/config";
import { createJokeInstruxBuffer } from "../instructionBuffer";


const sendJokeV2 = async ({ walletPublicKey, connection, sendTransaction, joke }) => {
  await createJokeInstruction_OneShotKey_version({
    walletPublicKey,
    connection,
    sendTransaction,
    joke
  });
};


// This works with v2 of the program where 1 joke = 1 ephemeral keypair
const createJokeInstruction_OneShotKey_version = async ({ connection, sendTransaction, walletPublicKey, joke }) => {
  // 1. Create an address for the joke account
  const oneShotKeyForTheJoke = Keypair.generate();

  // 2. Craft the create_joke Instruction
  const instruction = new TransactionInstruction({
    programId: programAddress,
    data: createJokeInstruxBuffer(joke, "v2"),
    keys: [
      { pubkey: oneShotKeyForTheJoke.publicKey, isSigner: true, isWritable: true },
      { pubkey: walletPublicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ]
  });

  // 3. Bundles the instruction into the transaction with the correct signers
  const transaction = new Transaction().add(instruction);
  const signers = [oneShotKeyForTheJoke];

  // 4. Shoot the transaction!
  const transactionSignature = await sendTransaction(transaction, connection, { signers });
  await connection.confirmTransaction(transactionSignature, "confirmed");
};


export {
  sendJokeV2
};

