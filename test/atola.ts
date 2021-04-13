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

import { Atola, Atola__factory, UniswapExchange__factory, UniswapFactory__factory, XCHF__factory } from '../typechain';
import { expect, use } from 'chai';
import { MockProvider, solidity} from 'ethereum-waffle';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "ethers";

use(solidity);

describe('Atola', () => {
  const [deployer, user] = new MockProvider().getWallets();

  let atola: Atola;
  let machineAddress: SignerWithAddress;
  let exchangeAddress: string;

  beforeEach(async() => {
    // deploy uniswap and token
    const uniswapFactory = await (new UniswapFactory__factory(deployer)).deploy();
    const uniswapTemplate = await (new UniswapExchange__factory(deployer)).deploy();
    const tokenXCHF = await (new XCHF__factory(deployer)).deploy();

    // init factory
    uniswapFactory.initializeFactory(uniswapTemplate.address);

    // get exchange address from factory deploy events
    const receipt = await (await uniswapFactory.createExchange(tokenXCHF.address)).wait();
    if (receipt.events !== undefined && receipt.events[0].args){
      exchangeAddress = receipt.events[0].args[0];
    } else {
      console.log("events undefined, receipt: ", receipt);
    }

    atola = await (new Atola__factory(deployer)).deploy(tokenXCHF.address, exchangeAddress);
  })

  it('should have a correct baseexchange address', async () => {
    const baseExchange = await atola.baseexchange();
    expect(baseExchange).to.equal(exchangeAddress);
  });

  it('should have a correct token count', async () => {
    const tokenCount = await atola.methods.getTokenCount().call();
    expect(tokenCount).to.equal(2);
  });

  it('should have correct tokens addresses', async () => {
    const exchangeAddressXCHF = await atola.supportedTokensArr(0);
    const exchangeAddressSCND = await atola.supportedTokensArr(1);

    // expect()
    // assert.equal(exchangeAddressXCHF.toString(), config.UNISWAP_EXCHANGE, 'XCHF exchange address is wrong');
    // assert.equal(exchangeAddressSCND.toString(), config.UNISWAP_EXCHANGE_SCND, 'SCND exchange address is wrong');
  });

  it('machine address is allowed as a BTM', async () => {
    const machineAddressPractical = await atola.machineAddressesArr(0);
    expect(machineAddress).to.equal(machineAddressPractical);
  });

  it('throws an CrptoPurchase event after a fiatToEth order', async () => {
    const amount = ethers.utils.formatEther(10);
    const tolerance = ethers.utils.formatEther(0.04); // tolerance should be 0 for buying

    // TxSend object
    atola = atola.connect(machineAddress);
    const tx = await atola.fiatToEth(amount, tolerance, user.address);
    const receipt = await tx.wait();

    expect(receipt.events).to.exist;
    expect(receipt.events).to.have.lengthOf(1);
    const event = receipt.events![0];
    expect(event.args).to.exist;
    expect(event.event).to.equal("CryptoPurchase")
 });


});
