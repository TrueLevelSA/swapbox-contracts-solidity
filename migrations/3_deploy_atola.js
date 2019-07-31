const fs = require('fs')
const path = require('path')
const Atola = artifacts.require('Atola')
const PriceFeed = artifacts.require('PriceFeed')
const CONFIG = path.resolve(__dirname, '../config')
const LOCAL_CONFIG = path.join(CONFIG, 'local.json')
const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require(LOCAL_CONFIG)

if (!config) { throw new Error('Missing config file') }

const baseToken = config.BASE_TOKEN
const baseExchange = config.UNISWAP_EXCHANGE
const secondExchange = config.UNISWAP_EXCHANGE_SCND

module.exports = async (deployer) => {
  await deployer.deploy(Atola, baseToken, baseExchange);
  const atola = await Atola.deployed();
  const priceFeed = await deployer.deploy(PriceFeed, atola.address);

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
};
