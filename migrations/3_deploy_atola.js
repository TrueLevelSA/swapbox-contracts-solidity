const fs = require('fs')
const path = require('path')
const Atola = artifacts.require('Atola')
const PriceFeed = artifacts.require('PriceFeed')
const TokenXchf = artifacts.require('XCHF')
const CONFIG = path.resolve(__dirname, '../config')
const LOCAL_CONFIG = path.join(CONFIG, 'private.json')
const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require(LOCAL_CONFIG)

if (!config) { throw new Error('Missing config file') }

const baseToken = config.BASE_TOKEN
const baseExchange = config.UNISWAP_EXCHANGE
const secondExchange = config.UNISWAP_EXCHANGE_SCND

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Atola, baseToken, baseExchange);
  const atola = await Atola.deployed();
  const priceFeed = await deployer.deploy(PriceFeed, atola.address);
  const tokenXchf = await TokenXchf.at(baseToken)

  config.ATOLA = atola.address;
  config.PRICEFEED = priceFeed.address;

  fs.writeFileSync(
    LOCAL_CONFIG,
    JSON.stringify(config, undefined, 2),
    'utf-8'
  )

  // assuming for now that supportedTokens holds exchange addresses
  await atola.addToken(baseExchange);
  await atola.addToken(secondExchange);

  // in dev mode create an account for the machine
  if (network === 'development') {
    const value = "1000000000000000000000"
    await atola.addMachine(accounts[2]);
    await tokenXchf.deposit({from: accounts[0], value: value})
    await tokenXchf.transfer(config.ATOLA, value, {from: accounts[0]})
    // await tokenXchf.approve(config.UNISWAP_EXCHANGE, "1000000000000000000000", {from: accounts[1]})
  }
};
