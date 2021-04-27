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

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { ethers } from "hardhat";
import { deploy } from "../scripts/deploy_utils";
import { Atola, CryptoFranc } from '../typechain';
import { ERC20, UniswapV2Pair } from '../typechain-extra';

chai.use(solidity);
const { expect } = chai;

describe('Atola', () => {

  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let machine: SignerWithAddress;

  let atola: Atola;
  let uniswapExchange: UniswapV2Pair;
  let tokenXCHF: CryptoFranc;
  let tokenWETH: ERC20;

  beforeEach(async () => {
    [deployer, user, machine] = await ethers.getSigners();

    const deployment = await deploy(deployer);
    atola = deployment.atola;
    uniswapExchange = deployment.uniswapExchange;
    tokenXCHF = deployment.tokenXCHF;
    tokenWETH = deployment.tokenETH;
  })

  it('should have a correct baseexchange address', async () => {
    const baseExchange = await atola.baseexchange();
    expect(baseExchange).to.equal(uniswapExchange.address);
  });

  it('should have a correct token count', async () => {
    const tokenCount = await atola.getTokenCount();
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
    await atola.addMachine(machine.address);

    const machineAddressPractical = await atola.machineAddressesArr(0);
    expect(machine.address).to.equal(machineAddressPractical);
  });

  it('throws an CrptoPurchase event after a fiatToEth order', async () => {
    const amount = ethers.utils.formatEther(10);
    const tolerance = ethers.utils.formatEther(0.04); // tolerance should be 0 for buying

    // TxSend object
    atola = atola.connect(machine.address);
    const tx = await atola.fiatToEth(amount, tolerance, user.address);
    const receipt = await tx.wait();

    expect(receipt.events).to.exist;
    expect(receipt.events).to.have.lengthOf(1);
    const event = receipt.events![0];
    expect(event.args).to.exist;
    expect(event.event).to.equal("CryptoPurchase")
  });


});
