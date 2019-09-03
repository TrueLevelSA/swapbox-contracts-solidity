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

const AtolaArtifacts = artifacts.require("Atola");
import { Atola } from '../contracts/types/Atola';
import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';
import { toWei } from 'web3x/utils';
const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require('../config/local.json')

contract('Atola', (accounts) => {
  let eth: Eth;
  let atola: Atola;
  let machineAddress: Address;
  let userAddress: Address;

  before(async () => {
    // retrieve current provider
    const currentEth = Eth.fromCurrentProvider();
    if (currentEth) {
      eth = currentEth;
    } else {
      throw Error('No web3 provider found');
    }
    const atolaAddress = (await AtolaArtifacts.deployed()).address;

    // retrieve deployed contracts
    atola = new Atola(eth, atolaAddress);

    // set machine/user addresses.
    machineAddress = Address.fromString(accounts[2]);
    userAddress = Address.fromString(accounts[3]);
  });

  it('verify baseexchange address', async () => {
    const baseExchangeToken = await atola.methods.baseexchange().call();
    assert.equal(baseExchangeToken, config.UNISWAP_EXCHANGE, "baseexchange address is not the same in the deployed contract than in the generated config file");
  });

  it('get correct token count', async () => {
    const tokenCount = await atola.methods.getTokenCount().call();
    assert.equal(tokenCount, "2", "token count should be 2");
  });

  it('get correct tokens addresses', async () => {
    const exchangeAddressXCHF = await atola.methods.supportedTokensArr(0).call();
    const exchangeAddressSCND = await atola.methods.supportedTokensArr(1).call();

    assert.equal(exchangeAddressXCHF.toString(), config.UNISWAP_EXCHANGE, 'XCHF exchange address is wrong');
    assert.equal(exchangeAddressSCND.toString(), config.UNISWAP_EXCHANGE_SCND, 'SCND exchange address is wrong');
  });

  it('machine address is allowed as a BTM', async () => {
    const machineAddressPractical = await atola.methods.machineAddressesArr(0).call();
    assert.deepEqual(machineAddress, machineAddressPractical, "machine address has not been added correctly");
  });

  it('throws an CrptoPurchase event after a fiatToEth order', async () => {
    const amount = toWei(new BN(10), "ether");
    const tolerance = toWei("0.04", "ether"); // tolerance should be 0 for buying

    // TxSend object
    const tx = atola.methods.fiatToEth(
      amount,
      tolerance,
      userAddress,
    );

    const txSend = tx.send({from:machineAddress});
    const hash = await txSend.getTxHash();
    const receipt = await txSend.getReceipt();

    assert.isDefined(hash, 'tx doesnt have a hash');
    // @ts-ignore: on purpose checking if object is undefined or not
    assert.isDefined(receipt.events["CryptoPurchase"][0], 'didnt throw a CryptoPurchase event');
  });


});
