const fs = require('fs')
const path = require('path')
const utils = require('../scripts/utils.js')
const CONFIG = path.resolve(__dirname, '../config')
const LOCAL_CONFIG = path.join(CONFIG, 'local.json')

// Require the contract name and not the file name
// https://ethereum.stackexchange.com/a/48643/24916
const BaseToken = artifacts.require('ERC20')
const UniSwapExchangeTemplate = artifacts.require('uniswap_exchange')
const UniSwapFactory = artifacts.require('uniswap_factory')
const UniswapExchangeInterface = artifacts.require('UniswapExchangeInterface');

const BN = web3.utils.BN;

module.exports = async (deployer, network, accounts) => {
  if(process.env.NODE_ENV === 'production'){
    console.error('you don\'t want to deploy exchange while in production');
    return;
  }

  const ERC20Config = {
    name: 'Swiss Token',
    symbol: 'XCHF',
    decimals: 18,
    supply: 10000000000000000000,
  }

  const secondTokenConfig = {
    name: 'Second Token',
    symbol: 'SCND',
    decimals: 18,
    supply: 10000000000000000000,
  }

  // Create the ERC20 token
  const baseToken = await BaseToken.new(
    utils.stringToBytes32(ERC20Config.name),
    utils.stringToBytes32(ERC20Config.symbol),
    utils.numberToUint(ERC20Config.decimals),
    utils.numberToUint(ERC20Config.supply),
    {
      from: accounts[0]
    }
  )

  const secondToken = await BaseToken.new(
    utils.stringToBytes32(secondTokenConfig.name),
    utils.stringToBytes32(secondTokenConfig.symbol),
    utils.numberToUint(secondTokenConfig.decimals),
    utils.numberToUint(secondTokenConfig.supply),
    {
      from: accounts[0]
    }
  )

  // Use the Factory to create the exchange
  const template = await deployer.deploy(UniSwapExchangeTemplate)

  // Create the UniSwap Factory
  const factory = await deployer.deploy(UniSwapFactory)

  // Set the template address
  await factory.initializeFactory(template.address)

  // Make a sanity check before moving forward. Since .createExchange() has mulitple
  // asserts and that truffles error messages are sparse, we ensure the required
  // values are defined before continuing.
  const factoryInitialisationCheck = await factory.exchangeTemplate.call()
  if (factoryInitialisationCheck === utils.zeroAddress) {
    throw new Error('Failed to set exchange template')
    process.exit(1)
  }

  // Now we can use the factory to generate a BaseToken Exchange
  let exchange;
  try {
    const createTx = await factory.createExchange(BaseToken.address, { gas: 4712388 })
    // Retrieve the created Exchange address from the logs
    exchange = createTx.receipt.logs[0].args.exchange

  } catch (e) {
    console.log('Failed to deploy Exchange', e)
  } finally {
    if (!exchange) { return }

    // Since the exchange address is not saved by truffle we generate a seperate
    // config file.
    const settings = {
      BASE_TOKEN: baseToken.address,
      SECOND_TOKEN: secondToken.address,
      UNISWAP_FACTORY: factory.address,
      UNISWAP_EXCHANGE_TEMPLATE: template.address,
      UNISWAP_EXCHANGE: exchange,
    }
    fs.writeFileSync(
      LOCAL_CONFIG,
      JSON.stringify(settings, undefined, 2),
      'utf-8'
    )
  }


  // ADD LIQUIDITY TO EXCHANGE
  // =========================
  const value = web3.utils.toWei(new BN(1));
  const token = await BaseToken.deployed();

  // deposit 1 ETH in baseToken
  await token.deposit({ from: accounts[0], value: value });

  // approve uniswap exchange for 1 ETH
  await token.approve(exchange, value, { from: accounts[0] });

  // get exchange at newly deployed address
  const exchangeInterface = await UniswapExchangeInterface.at(exchange);

  // function call parameters
  const minLiquidity = 0;   // we don't care since total_liquidity will be 0
  const maxTokens = 1000;   // 1000 tokens for 1 ETH
  const deadline = Math.ceil(Date.now() / 1000) + ( 60 * 15) //15min. from now

  // tx parameters
  const from = accounts[0];

  try {
    const initialLiquidity = await exchangeInterface.addLiquidity(
      minLiquidity,
      maxTokens,
      deadline,
      {
        from: from,
        value: value,
      }
    );
  } catch (e) {
    console.log(e);
  }



};
