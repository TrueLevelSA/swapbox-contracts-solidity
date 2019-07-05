const AtolaTruffle = artifacts.require("Atola");
import { Atola } from './types/Atola';
const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require('../config/local.json')

contract('Atola', (accounts) => {
  it('verify baseexchange address', async () => {
    const atola: Atola = (await AtolaTruffle.deployed()).contract;
    const baseExchangeToken = await atola.methods.baseexchange().call();
    assert.equal(baseExchangeToken, config.UNISWAP_EXCHANGE, "baseexchange address is not the same in the deployed contract than in the generated config file");
  });
});
