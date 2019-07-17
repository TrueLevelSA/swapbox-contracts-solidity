const AtolaArtifacts = artifacts.require("Atola");
import { Atola } from './types/Atola';
import { Eth } from 'web3x/eth';
const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require('../config/local.json')

contract('Atola', (accounts) => {
  let eth: Eth;
  let atola: Atola;

  before(async () => {
    // retrieve current provider
    const currentEth = Eth.fromCurrentProvider();
    if (currentEth) {
      eth = currentEth;
    } else {
      throw Error('No web3 provider found');
    }
    const atolaAddress = (await AtolaArtifacts.deployed()).address;

    // retrieve deployed contracts
    atola = new Atola(eth, atolaAddress);
  });

  it('verify baseexchange address', async () => {
    const baseExchangeToken = await atola.methods.baseexchange().call();
    assert.equal(baseExchangeToken, config.UNISWAP_EXCHANGE, "baseexchange address is not the same in the deployed contract than in the generated config file");
  });

  it('get correct token count', async () => {
    const tokenCount = await atola.methods.getTokenCount().call();
    assert.equal(tokenCount, "2", "token count should be 2");
  });

  it('get correct tokens addresses', async () => {
    const exchangeAddressXCHF = await atola.methods.supportedTokensArr(0).call();
    const exchangeAddressSCND = await atola.methods.supportedTokensArr(1).call();

    assert.equal(exchangeAddressXCHF.toString(), config.UNISWAP_EXCHANGE, 'XCHF exchange address is wrong');
    assert.equal(exchangeAddressSCND.toString(), config.UNISWAP_EXCHANGE_SCND, 'SCND exchange address is wrong');
  });


});
