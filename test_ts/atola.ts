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

  it('should call a function that depends on a linked library', async () => {
    const atolaInstance = await AtolaTruffle.deployed();
    const atolaBalance = (await atolaInstance.getBalance.call(accounts[0])).toNumber();
    const atolaEthBalance = (await atolaInstance.getBalanceInEth.call(accounts[0])).toNumber();

    assert.equal(atolaEthBalance, 2 * atolaBalance, 'Library function returned unexpected function, linkage may be broken');
  });

  it('should send coin correctly', async () => {
    const atolaInstance = await AtolaTruffle.deployed();

    // Setup 2 accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];

    // Get initial balances of first and second account.
    const accountOneStartingBalance = (await atolaInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoStartingBalance = (await atolaInstance.getBalance.call(accountTwo)).toNumber();

    // Make transaction from first account to second.
    const amount = 10;
    await atolaInstance.sendCoin(accountTwo, amount, { from: accountOne });

    // Get balances of first and second account after the transactions.
    const accountOneEndingBalance = (await atolaInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoEndingBalance = (await atolaInstance.getBalance.call(accountTwo)).toNumber();


    assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  });
});
