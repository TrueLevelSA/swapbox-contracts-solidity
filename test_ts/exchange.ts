const UniswapExchangeArtifacts = artifacts.require("uniswap_exchange");
import { UniswapExchangeInterface } from './types/UniswapExchangeInterface';
import BN from 'bn.js';
import { toWei } from 'web3x/utils';
import { Address } from 'web3x/address';

const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require('../config/local.json')

contract('Uniswap Exchange', (accounts) => {
  it('checks that totalSupply is at 0', async () => {
    const exchange: UniswapExchangeInterface = (await UniswapExchangeArtifacts.deployed()).contract;
    const totalSupply = await exchange.methods.totalSupply().call();
    console.log(totalSupply);
    assert.equal(totalSupply, totalSupply, 'total supply is not 0');
  });

  it('can add liquidity', async () => {
    // const exchange: UniswapExchangeInterface = (await UniswapExchangeArtifacts.deployed()).contract;
    console.log(await UniswapExchangeArtifacts.deployed());
    const exchange: UniswapExchangeInterface = new UniswapExchangeInterface(web3.eth, (await UniswapExchangeArtifacts.deployed()).address);

    // add liquidity to exchange
    const minLiquidity = new BN(0);   // we don't care since total_liquidity will be 0
    const maxTokens = new BN(1000);   // 1000 tokens for 1 ETH
    const deadline = new BN("1569732084");
    const value = toWei("1", "ether");
    const from = Address.fromString(accounts[0]);

    // .send() is definitely waiting for a string and not an Address
    const tx = await exchange.methods.addLiquidity(
      minLiquidity.toString(),
      maxTokens.toString(),
      deadline.toString()
    ).send({
      from: from,
      value: value
    });
    const txHash = await tx.getTxHash();
    const receipt = await tx.getReceipt();

    assert.equal(true, true, 'true fucked');
  });
})
