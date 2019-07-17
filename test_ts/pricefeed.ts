const PriceFeedArtifacts = artifacts.require("PriceFeed");
const AtolaArtifacts = artifacts.require("Atola");
import { PriceFeed } from './types/PriceFeed';
import { Atola } from './types/Atola';
import { Eth } from 'web3x/eth';
import { fromWei } from 'web3x/utils';

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

  it('get correct balances', async () => {
    const balances = await priceFeed.methods.getBalances().call();

    const addresses = balances[0].map(address => address.toString());
    const tokenBalances = balances[1];
    const ethBalances = balances[2].map(
      ethBalance => fromWei(ethBalance, "ether")
    );

    // TODO: use a config file for default setup of liquidity
    assert.equal(tokenBalances[0], '1000', 'tokenBalance is wrong in baseToken');
    assert.equal(tokenBalances[1], '1000', 'tokenBalance is wrong in scndToken');

    assert.equal(ethBalances[0], '1', 'ethBalances is wrong for baseToken');
    assert.equal(ethBalances[1], '1', 'ethBalances is wrong for scndToken');
  });
});
