//region Do not use
// No reason for anyone to use the below code,
// it's just a hack for the sake of not using anchor code with an anchor program
// https://solana.stackexchange.com/questions/1833/how-to-serialize-instruction-buffer-for-an-anchor-program
//
// -> If you are using js just use the typescript lib @project-serum/anchor or the src/utils/anchor folder
//
import { Buffer } from "buffer";
import { sha256 } from "js-sha256";
import * as BN from "bn.js";


const createJokeInstruxBuffer = (joke, version='v3') => {
  const anchorName = 'global' + ':' + 'create_joke' + '_' + version.toLowerCase();
  const ixSigHash = Buffer.from(sha256.digest(anchorName)).slice(0, 8);

  const string_u8vec = new TextEncoder().encode(joke);
  const string_u8vec_length = Buffer.from(new Uint8Array(new BN(string_u8vec.length).toArray("le", 4)));
  return Buffer.concat([ixSigHash, string_u8vec_length, string_u8vec]);
};


export {
  createJokeInstruxBuffer
};
//endregion