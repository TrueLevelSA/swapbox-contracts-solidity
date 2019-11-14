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

import { Address } from "web3x/address";
import { Eth } from "web3x/eth";

import { Atola } from "../contracts/types/Atola";
import { PriceFeed } from "../contracts/types/PriceFeed";
import { XCHF } from "../contracts/types/XCHF";

import * as fs from "fs";
import * as path from "path";
const CFG = '../contracts/deployed/private.json';
const PRIVATE_CONFIG = path.resolve(__dirname, CFG);

import * as deployed from "../contracts/deployed/private.json";
import { LegacyProviderAdapter, LegacyProvider } from "web3x/providers";

const baseToken = Address.fromString(deployed.BASE_TOKEN);
const baseExchange = Address.fromString(deployed.UNISWAP_EXCHANGE);

module.exports = async (deployer: Truffle.Deployer, network: string, accounts: Truffle.Accounts) => {
  const eth = new Eth(new LegacyProviderAdapter(web3.currentProvider as LegacyProvider));

  const acc = accounts.map(account => Address.fromString(account));
  let from = acc[0];
  
  const atola = new Atola(eth);
  const priceFeed = new PriceFeed(eth);
  const token = new XCHF(eth, baseToken);  
  
  // deploy ATOLA/PRICEFEED
  await atola.deploy(baseToken, baseExchange).send({from}).getReceipt();
  console.log(`Atola deployed: ${atola.address}`);
  await priceFeed.deploy(atola.address!).send({from}).getReceipt();
  console.log(`PriceFeed deployed: ${priceFeed.address}`);
  

  // copy deployed addresses, update ATOLA/PRICEFEED addresses and overwrite
  const deployedCopy = { ...deployed };
  deployedCopy.ATOLA = atola.address!.toString();
  deployedCopy.PRICEFEED = priceFeed.address!.toString();
  fs.writeFileSync(PRIVATE_CONFIG, JSON.stringify(deployedCopy, undefined, 2), 'utf-8');

  await atola.methods.addToken(baseExchange).send({from}).getReceipt();

  const value = "1000000000000000000000";
  await atola.methods.addMachine(acc[2]).send({from}).getReceipt();
  await token.methods.deposit().send({from: acc[0], value: value}).getReceipt();
  await token.methods.transfer(atola.address!, value).send({from: acc[0]}).getReceipt();
};
