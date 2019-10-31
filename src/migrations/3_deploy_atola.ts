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
const CONFIG = path.resolve(__dirname, '../config')
const LOCAL_CONFIG = path.join(CONFIG, 'private.json')

import * as deployed from "../contracts/deployed/private.json";

const baseToken = Address.fromString(deployed.BASE_TOKEN);
const baseExchange = Address.fromString(deployed.UNISWAP_EXCHANGE);

module.exports = async (deployer: Truffle.Deployer, network: string, accounts: Truffle.Accounts) => {
  const eth = Eth.fromCurrentProvider()!;

  const atola = new Atola(eth);
  const priceFeed = new PriceFeed(eth);
  const token = new XCHF(eth, baseToken);

  // deploy ATOLA/PRICEFEED
  await atola.deploy(baseToken, baseExchange).send().getReceipt();
  await priceFeed.deploy(atola.address!).send().getReceipt();

  // copy deployed addresses, update ATOLA/PRICEFEED addresses and overwrite
  const deployedCopy = { ...deployed };
  deployedCopy.ATOLA = atola.address!.toString();
  deployedCopy.PRICEFEED = priceFeed.address!.toString();
  fs.writeFileSync(LOCAL_CONFIG, JSON.stringify(deployedCopy, undefined, 2), 'utf-8');

  await atola.methods.addToken(baseExchange).send().getReceipt();

  const acc = accounts.map(account => Address.fromString(account));

  const value = "1000000000000000000000";
  await atola.methods.addMachine(acc[2]);
  await token.methods.deposit().send({from: acc[0], value: value}).getReceipt();
  await token.methods.transfer(atola.address!, value).send({from: acc[0]}).getReceipt();
};
