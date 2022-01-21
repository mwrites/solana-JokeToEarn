import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Joketoearn } from '../target/types/joketoearn';

describe('joketoearn', () => {
  // 1. Get a connection to a Blockchain Node
  anchor.setProvider(anchor.Provider.env());

  // 2. Get a hand on our Program
  const program = anchor.workspace.Joketoearn as Program<Joketoearn>;

  it('It Creates a Joke!', async () => {
    // Create an address for the soon-to-be created Account
    const jokeAccountKeypair = anchor.web3.Keypair.generate()

    // Craft the createJoke Instruction
    const tx = await program.rpc.createJoke('Not funny..', {
      accounts: {
        jokeAccount: jokeAccountKeypair.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      // We need to provide not only the publicKey
      // but also sign with the privateKey to prove that we own jokeAccountKeypair.publicKey
      signers: [jokeAccountKeypair]
    });

    console.log("Your transaction signature", tx);

    // Fetch all joke accounts
    const jokes = await program.account.joke.all();
    console.log(jokes);
  });
});


