const Atola = artifacts.require('Atola')
const Pricefeed = artifacts.require('PriceFeed')
const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require('../config/local.json')

if (!config) { throw new Error('Missing config file') }

const baseToken = config.BASE_TOKEN
const secondToken = config.SECOND_TOKEN
const baseExchange = config.UNISWAP_EXCHANGE

module.exports = async (deployer) => {
  await deployer.deploy(Atola, baseToken, baseExchange);
  const atola = await Atola.deployed();
  const priceFeed = await deployer.deploy(PriceFeed, atola.address);

  atola.addToken(baseToken);
  atola.addToken(secondToken);
};
