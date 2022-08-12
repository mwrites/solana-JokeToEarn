import { programAddress } from "../../utils/config";
import * as BN from "bn.js";


const getProgramAccountsWrapper = async ({ connection, jokeModel }) => {
  // 1. Get accounts only with the created_at field instead of the full data

  const joke = new jokeModel()
  const accounts = await connection.getProgramAccounts(programAddress, joke.created_at_filter);

  // 2. Sort the addresses by created_at field
  const accountsWithTimestamp = accounts.map(({ pubkey, account }) => ({
    pubkey, created_at: new BN(account.data, "le")
  }));
  const pubkeysSortedByTimestamp = accountsWithTimestamp.sort((a, b) => b.created_at.cmp(a.created_at)).map(({ pubkey }) => (pubkey));

  // 3. Now we have these addresses sorted we can give this sorted collection to fetchMultiple (getMultipleAccountsInfo)
  const accountsWithData = await connection.getMultipleAccountsInfo(pubkeysSortedByTimestamp);

  // 4. AccountsWithData is not returning the addresses, so we add this back into our Joke class
  let i = 0;
  return accountsWithData.map(({ data }) => {
    let joke = new jokeModel();
    joke.initFromDeserialization({ buffer: data });
    joke.pubkey = pubkeysSortedByTimestamp[i++];
    return joke;
  });
};


export {
  getProgramAccountsWrapper
};