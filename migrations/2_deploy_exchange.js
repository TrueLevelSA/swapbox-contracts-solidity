const fs = require('fs')
const path = require('path')
const utils = require('../scripts/utils.js')
const CONFIG = path.resolve(__dirname, '../config')
const LOCAL_CONFIG = path.join(CONFIG, 'local.json')

// Require the contract name and not the file name
// https://ethereum.stackexchange.com/a/48643/24916
const TokenErc20 = artifacts.require('ERC20')
const TokenXchf = artifacts.require('XCHF')
const UniSwapExchangeTemplate = artifacts.require('uniswap_exchange')
const UniSwapFactory = artifacts.require('uniswap_factory')
const UniswapExchangeInterface = artifacts.require('UniswapExchangeInterface');

const BN = web3.utils.BN;

/**
 * Deploy a standard ERC20 Token and return the truffle instance of the contract.
 *
 * @param config {name, symbol, decimals, supply}
 * @param account The web3 account from which we deploy the Token
 */
const createToken = (config) => {
  return TokenErc20.new(
    utils.stringToBytes32(config.name),
    utils.stringToBytes32(config.symbol),
    utils.numberToUint(config.decimals),
    utils.numberToUint(config.supply),
  );
}

/**
 * Deploy a Uniswap Exchange for the given token.
 *
 * @param factory The Uniswap Factory truffle contract
 * @param token The Token for which we create the exchange
 */
const createExchange = async (factory, token) => {
  let exchangeAddress;
  try {
    const createTx = await factory.createExchange(token.address, { gas: 4712388 })
    // Retrieve the created Exchange address from the logs
    exchangeAddress = createTx.receipt.logs[0].args.exchange
  } catch (e) {
    console.error('Failed to deploy Exchange', e)
  }

  return UniswapExchangeInterface.at(exchangeAddress);
}

module.exports = async (deployer, network, accounts) => {
  if (network === 'production') {
    console.error('Not deploying anything uniswap-related while in production');
    return;
  }

  // Use the Factory to create the exchange
  const template = await UniSwapExchangeTemplate.new();

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

  // deploy XCHF and SCND tokens
  const tokenXchf = await TokenXchf.new();
  const tokenScnd = await createToken({ name: 'Second Token', symbol: 'SCND', decimals: 18, supply: 10000000000000000000 });

  const exchangeXchf = await createExchange(factory, tokenXchf);
  const exchangeScnd = await createExchange(factory, tokenScnd);

  // Since the exchange address is not saved by truffle we generate a seperate
  // config file.
  const settings = {
    BASE_TOKEN: tokenXchf.address,
    SECOND_TOKEN: tokenScnd.address,
    UNISWAP_FACTORY: factory.address,
    UNISWAP_EXCHANGE_TEMPLATE: template.address,
    UNISWAP_EXCHANGE: exchangeXchf.address,
    UNISWAP_EXCHANGE_SCND: exchangeScnd.address,
  };

  fs.writeFileSync(
    LOCAL_CONFIG,
    JSON.stringify(settings, undefined, 2),
    'utf-8'
  )


  // ADD LIQUIDITY TO EXCHANGE
  // =========================
  const value = web3.utils.toWei(new BN(500));
  const xchfValue = value.muln(200);
  const liquidityProvider = accounts[1];

  // deposit and approve `value` in both tokens
  await tokenXchf.deposit({ from: liquidityProvider, value: value });
  await tokenXchf.approve(exchangeXchf.address, xchfValue, { from: liquidityProvider });

  await tokenScnd.deposit({ from: liquidityProvider, value: value });
  await tokenScnd.approve(exchangeScnd.address, value, { from: liquidityProvider });

  // function call parameters
  const minLiquidity = 0;   // we don't care since `total_liquidity` will be 0
  const maxTokens = value;   // 1000 tokens
  const deadline = Math.ceil(Date.now() / 1000) + ( 60 * 15) //15min. from now

  // Add `value` liquidity to exchanges
  await exchangeXchf.addLiquidity(minLiquidity, xchfValue, deadline, { from: liquidityProvider, value: value, });
  await exchangeScnd.addLiquidity(minLiquidity, maxTokens, deadline, { from: liquidityProvider, value: value, });
};
