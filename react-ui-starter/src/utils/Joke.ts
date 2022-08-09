import * as borsh from "@project-serum/borsh";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { sha256 } from "js-sha256";
import BN from "bn.js";


const JOKE_ACCOUNT_SCHEMA = borsh.struct([
  borsh.publicKey("author"),
  borsh.i64("created_at"),
  borsh.str("content"),
]);


class Joke {
  constructor(public author: PublicKey, public created_at: BN, public content: String) { }

  static initFromDeserialization(buffer: Buffer, isAnchor=true): Joke {
    const data = isAnchor ? buffer.slice(8) : buffer;

    const { author, content, created_at } = JOKE_ACCOUNT_SCHEMA.decode(data);
    return new Joke(author, created_at, content);
  }

  // Size infos
  static discriminator_size = 8;
  static author_size = 32;
  static created_at_size = 8;
  static content_size = 80; // 4 for len + 80 characters max

  // Offsets
  static author_offset = 0 + Joke.discriminator_size
  static created_at_offset = Joke.author_offset + Joke.author_size
  static content_offset = Joke.created_at_offset + Joke.created_at_size


  static discriminator = Buffer.from(sha256.digest('account:Joke')).slice(0, 8);

  static created_at_filter = {
    dataSlice: { offset: Joke.created_at_offset, length: Joke.created_at_size},
    filters: [
      { memcmp: { offset: 0, bytes: bs58.encode(Joke.discriminator) } },
    ],
  }

  get date () {
    const bignum = new BN(this.created_at, 'le');
    const num = bignum.toNumber();
    const date = new Date(num * 1000);
    return date.toLocaleDateString()
  }
}


export default Joke;