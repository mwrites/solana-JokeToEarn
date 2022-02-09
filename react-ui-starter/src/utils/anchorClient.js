import { Connection } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { programAddress, connectionsOptions } from './config';


const getConnectionProvider = (wallet, network) => {
    const connection = new Connection(
        network,
        connectionsOptions.preflightCommitment
    );
    const provider = new Provider(
        connection,
        wallet,
        connectionsOptions.preflightCommitment
    );
    return provider;
};

const getProgram = async (wallet, network) => {
    // Get a connection
    const provider = await getConnectionProvider(wallet, network);
    // Get metadata about your solana program
    const idl = await Program.fetchIdl(programAddress, provider);
    // Create a program that you can call
    return new Program(idl, programAddress, provider);
};

const fetchJokes = async (wallet, network) => {
    const program = await getProgram(wallet, network);
    const jokes = await program.account.joke.all();
    return jokes;
}

const sendJoke = async (wallet, network, joke) => {
    const program = await getProgram(wallet, network);
    const jokeAccountKeypair = web3.Keypair.generate()

    // Craft the createJoke Instruction
    const tx = await program.rpc.createJoke(joke, {
        accounts: {
            jokeAccount: jokeAccountKeypair.publicKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
        },
        signers: [jokeAccountKeypair]
    });
    console.log(tx);
}

export  {
    fetchJokes,
    sendJoke,
};
