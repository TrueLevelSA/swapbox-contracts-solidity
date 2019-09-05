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

const CONFIG = path.resolve(__dirname, '../config')
const LOCAL_CONFIG = path.join(CONFIG, 'private.json')

import { XCHF } from "../contracts/types/XCHF";
import { UniswapFactory } from "../contracts/types/UniswapFactory";
import { UniswapExchange } from "../contracts/types/UniswapExchange";

/**
 * Main.
 */
module.exports = async (deployer: Truffle.Deployer, network: string, accounts: Truffle.Accounts) => {
  if (network === 'production') {
    console.error('Not deploying anything uniswap-related while in production');
    return;
  }
  const eth = Eth.fromCurrentProvider()!;

  // contracts.
  const template = new UniswapExchange(eth);
  const factory = new UniswapFactory(eth);
  const tokenXCHF = new XCHF(eth);

  // deploy uniswap factory/template
  await template.deploy().send().getReceipt();
  await factory.deploy().send().getReceipt();

  // set template address
  await factory.methods.initializeFactory(template.address!).send().getReceipt();

  // deploy XCHF
  await tokenXCHF.deploy().send().getReceipt();

  const receipt = await factory.methods.createExchange(tokenXCHF.address!).send().getReceipt();
  const exchangeAddress = receipt.events!.NewExchange[0].address;
  const exchange = new UniswapExchange(eth, exchangeAddress);

  // Since the exchange address is not saved by truffle we generate a seperate config file
  const settings = {
    BASE_TOKEN: tokenXCHF.address,
    UNISWAP_FACTORY: factory.address,
    UNISWAP_EXCHANGE_TEMPLATE: template.address,
    UNISWAP_EXCHANGE: exchange.address,
  };
  fs.writeFileSync(LOCAL_CONFIG, JSON.stringify(settings, undefined, 2), 'utf-8')


  // ADD LIQUIDITY TO EXCHANGE
  // =========================
  const value = web3.utils.toWei(new BN(500)).muln(200).toString();
  const from = Address.fromString(accounts[1]);
  const minLiquidity = 0;   // not used for the first liquidity provider
  const deadline = Math.ceil(Date.now() / 1000) + ( 60 * 15) //15min. from now

  // deposit/approve the token. then addLiquidity to exchange
  await tokenXCHF.methods.deposit().send({ from, value });
  await tokenXCHF.methods.approve(exchange.address!, value).send({ from });
  await exchange.methods.addLiquidity(minLiquidity, value, deadline).send({from, value});
};
