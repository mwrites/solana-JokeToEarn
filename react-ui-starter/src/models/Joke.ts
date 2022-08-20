import * as borsh from "@project-serum/borsh";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { sha256 } from "js-sha256";
import BN from "bn.js";


class Joke {
  // Size infos
  get discriminator_size() {
    return 8;
  }

  get author_size() {
    return 32;
  }

  get created_at_size() {
    return 8;
  }

  get content_size() {
    return 84;
  } // 4 for len + 80 characters max

  // Offsets
  get author_offset() {
    return 0 + this.discriminator_size;
  }

  get created_at_offset() {
    return this.author_offset + this.author_size;
  }

  get content_offset() {
    return this.created_at_offset + this.created_at_size;
  }


  get version() {
    return "";
  }

  get discriminator() {
    return Buffer.from(sha256.digest("account:Joke" + this.version)).slice(0, 8);
  }

  get created_at_filter() {
    return {
      dataSlice: { offset: this.created_at_offset, length: this.created_at_size },
      filters: [
        { memcmp: { offset: 0, bytes: bs58.encode(this.discriminator) } }
      ]
    };
  }
}


class JokeV1 extends Joke {
  get version() {
    return 'V1';
  }

  public author: PublicKey;
  public created_at: BN;
  public content: String;

  initFromDeserialization = ({ buffer, isAnchor = true }) => {
    const data = isAnchor ? buffer.slice(8) : buffer;

    const schema = borsh.struct([
      borsh.publicKey("author"),
      borsh.i64("created_at"),
      borsh.str("content")
    ]);

    const { author, created_at, content } = schema.decode(data);
    this.author = author;
    this.created_at = created_at;
    this.content = content;
  };

  get date() {
    const bignum = new BN(this.created_at, "le");
    const num = bignum.toNumber();
    const date = new Date(num * 1000);
    return date.toLocaleDateString();
  }
}


class JokeV2 extends Joke {
  get version() {
    return 'V2';
  }

  public author: PublicKey;
  public created_at: BN;
  public votes: number;
  public content: String;


  initFromDeserialization = ({ buffer, isAnchor = true }) => {
    const data = isAnchor ? buffer.slice(8) : buffer;

    const schema = borsh.struct([
      borsh.publicKey("author"),
      borsh.i64("created_at"),
      borsh.u32("votes"),
      borsh.str("content")
    ]);

    const { author, created_at, votes, content } = schema.decode(data);
    this.author = author;
    this.created_at = created_at;
    this.votes = votes;
    this.content = content;
  };

  get date() {
    const bignum = new BN(this.created_at, "le");
    const num = bignum.toNumber();
    const date = new Date(num * 1000);
    return date.toLocaleDateString();
  }
}


export {
  JokeV1,
  JokeV2
};