import { UniswapExchangeInterface } from './types/UniswapExchangeInterface';
import { ERC20 } from './types/ERC20';
import { fromWei, toBN } from 'web3x/utils';
import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';

const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require('../config/local.json')



contract('Uniswap Exchange', (accounts) => {
  let eth: Eth;
  let exchange: UniswapExchangeInterface;
  let exchangeAddress: Address;

  before(() => {
    // retrieve current provider
    const currentEth = Eth.fromCurrentProvider();
    if (currentEth) {
      eth = currentEth;
    } else {
      throw Error('No web3 provider found');
    }

    // retrieve deployed contracts
    exchange = new UniswapExchangeInterface(eth, config.UNISWAP_EXCHANGE);

    // params
    if(exchange.address) {
      exchangeAddress = exchange.address;
    }

    // various checks
    if(!exchangeAddress) {
      throw Error('Exchange address not set');
    }
  });

  it('checks factory address', async () => {
    const factoryAddress = await exchange.methods.factoryAddress().call();
    assert.equal(factoryAddress, config.UNISWAP_FACTORY, 'factory address is wrong');
  });

  it('checks token address', async () => {
    const tokenAddress = await exchange.methods.tokenAddress().call();
    assert.equal(tokenAddress, config.BASE_TOKEN, 'token address is wrong');
  });
})
