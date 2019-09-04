// Swap-box
// Copyright (C) 2019  TrueLevel SA
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import BN from "bn.js";
import * as fs from "fs";
import * as path from "path";

import { Address } from "web3x/address";
import { Eth } from "web3x/eth";
import { WebsocketProvider } from "web3x/providers";

const utils = require('../scripts/utils.js')
const CONFIG = path.resolve(__dirname, '../config')
const LOCAL_CONFIG = path.join(CONFIG, 'private.json')

// Require the contract name and not the file name
// https://ethereum.stackexchange.com/a/48643/24916
const TokenErc20 = artifacts.require('ERC20')
const TokenXchf = artifacts.require('XCHF')
const UniSwapExchangeTemplate = artifacts.require('uniswap_exchange')
const UniSwapFactory = artifacts.require('uniswap_factory')
const UniswapExchangeInterface = artifacts.require('UniswapExchangeInterface');

import { ERC20 } from "../contracts/types/ERC20";
import { UniswapFactory } from "../contracts/types/UniswapFactory";
import { UniswapExchange } from "../contracts/types/UniswapExchange";


interface ITokenParameters {
  name: string;
  symbols: string;
  decimals: number;
  supply: BN;
}

/**
 * Deploy a standard ERC20 Token and return the truffle instance of the contract.
 *
 * @param config {name, symbol, decimals, supply}
 * @param account The web3 account from which we deploy the Token
 */
const createToken = async (eth: Eth, parameters: ITokenParameters) => {
  const token = new ERC20(eth);
  return token.deploy(
    config.name,
    config.symbols,
    config.decimals,
    config.supply
  ).send();
}

/**
 * Deploy a Uniswap Exchange for the given token.
 *
 * @param factory The Uniswap Factory
 * @param token The Token for which we create the exchange
 */
const createExchange = async (factory: UniswapFactory, tokenAddress: Address) => {
  try {
    return factory.methods.createExchange(tokenAddress).send().getReceipt(); // gas: 4712388 jic
  } catch (e) {
    console.error('Failed to deploy Exchange', e)
    return Address.ZERO;
  }
}

/**
 * Main.
 *
 */

module.exports = async (deployer: Truffle.Deployer, network: string, accounts: Truffle.Accounts) => {
  if (network === 'production') {
    console.error('Not deploying anything uniswap-related while in production');
    return;
  }
  const provider = new WebsocketProvider(web3.currentProvider.connection.url);
  const eth = new Eth(provider);

  const uniSwapExchangeTemplate = await UniSwapExchangeTemplate.new();
  const uniswapFactory = new UniswapFactory()
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
