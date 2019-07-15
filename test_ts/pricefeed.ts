const PriceFeedArtifacts = artifacts.require("PriceFeed");
const AtolaArtifacts = artifacts.require("Atola");
import { PriceFeed } from './types/PriceFeed';
import { Atola } from './types/Atola';
import { Eth } from 'web3x/eth';

contract('PriceFeed', (accounts) => {
  let eth;
  let atola: Atola;
  let priceFeed: PriceFeed;

  before(async () => {
    // retrieve current provider
    const currentEth = Eth.fromCurrentProvider();
    if (currentEth) {
      eth = currentEth;
    } else {
      throw Error('No web3 provider found');
    }
    const atolaAddress = (await AtolaArtifacts.deployed()).address;
    const priceFeedAddress = (await PriceFeedArtifacts.deployed()).address;

    // retrieve deployed contracts
    atola = new Atola(eth, atolaAddress);
    priceFeed = new PriceFeed(eth, priceFeedAddress);
  });

  it('priceFeedAddress', async () => {
    const balances = await priceFeed.methods.getBalances().call();
    // const supportedTokens = await atola.methods.supportedTokensArr().call();
    const addresses = balances.map(b => b[0].toString());
    console.log(addresses);
    assert.equal(true, true, "TODO");
  });
});
