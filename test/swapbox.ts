// Swapbox
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

import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import chai from 'chai';
import {solidity} from 'ethereum-waffle';
import {ethers} from "hardhat";
import {deploySwapbox, deployToken, deployUniswapEnv} from "../scripts/deploy_utils";
import {CryptoFranc, ERC20, Swapbox, UniswapV2Pair} from '../typechain';
import {BigNumber} from "ethers";

chai.use(solidity);
const {expect} = chai;

describe('SwapBox', () => {
    let deployer: SignerWithAddress;
    let user: SignerWithAddress;
    let machine: SignerWithAddress;

    let swapbox: Swapbox;
    let uniswapExchange: UniswapV2Pair;
    let tokenXCHF: CryptoFranc;
    let tokenWETH: ERC20;

    beforeEach(async () => {
        [deployer, user, machine] = await ethers.getSigners();

        const deployment = await deployUniswapEnv(deployer);
        uniswapExchange = deployment.exchange;
        tokenXCHF = deployment.tokenXCHF;
        tokenWETH = deployment.tokenETH;

        swapbox = await deploySwapbox(deployer, deployment);
    })

    it('should correctly add a new supported token', async () => {
        const monero = await deployToken(deployer, "Monero", "XMR");

        // static call should confirm it will work
        const added = await swapbox.callStatic.addToken(monero.address);
        expect(added).to.be.true;

        await swapbox.addToken(monero.address);
        const tokenCount = await swapbox.getTokenCount();
        expect(tokenCount).to.equal(1);

        const tokens = await swapbox.supportedTokensList();
        expect(tokens).to.have.length(1);
        expect(tokens.at(0)).to.equal(monero.address);
    });

    it('should remove an existing supported token', async () => {
        const monero = await deployToken(deployer, "Monero", "XMR");
        await swapbox.addToken(monero.address);

        // static call should confirm it will work
        const removed = await swapbox.callStatic.removeToken(monero.address);
        expect(removed).to.be.true;

        await swapbox.removeToken(monero.address);
        const tokenCount = await swapbox.getTokenCount();
        expect(tokenCount).to.equal(0);
    });

    it('should not remove an non-existing token', async () => {
        const monero = await deployToken(deployer, "Monero", "XMR");
        await swapbox.addToken(monero.address);
        const removed = await swapbox.callStatic.removeToken(ethers.constants.AddressZero)
        expect(removed).to.be.false;

        await swapbox.removeToken(ethers.constants.AddressZero);
        const tokenCount = await swapbox.getTokenCount();
        expect(tokenCount).to.equal(1);
    });

    it('emit a `MachineAuthorized` event when authorizing a machine', async () => {
        await expect(swapbox.authorizeMachine(machine.address))
            .to.emit(swapbox, 'MachineAuthorized')
            .withArgs(machine.address);
    });

    it('authorize a machine', async () => {
        await swapbox.authorizeMachine(machine.address);
        const isAuthorized = await swapbox.isAuthorized(machine.address);
        expect(isAuthorized).to.be.true;
    });

    it('should buy ETH through a fiatToEth order', async () => {
        const mintAmount = ethers.utils.parseEther("50");
        const userAmountFiat = ethers.utils.parseEther("10");
        const buyPriceTolerance = ethers.utils.parseEther("0.04");

        await tokenXCHF.mint(machine.address, mintAmount);
        await swapbox.authorizeMachine(machine.address);

        swapbox = swapbox.connect(machine.address);
        const a = await swapbox.callStatic.fiatToEth(
            userAmountFiat,
            buyPriceTolerance,
            user.address,

        );
        expect(a).to.be.true;

        // FIX:
        expect(await swapbox.fiatToEth(userAmountFiat, buyPriceTolerance, user.address))
            .to.changeEtherBalance(user.address, userAmountFiat);

    });

    it('emit a `CryptoPurchase` event after a fiatToEth order', async () => {
        await tokenXCHF.mint(machine.address, ethers.utils.parseEther("50"));
        await swapbox.authorizeMachine(machine.address);

        const amount = ethers.utils.parseEther("10");
        const tolerance = ethers.utils.parseEther("0.04");
        swapbox = swapbox.connect(machine.address);

        await expect(swapbox.fiatToEth(amount, tolerance, user.address))
            .to.emit(swapbox, 'CryptoPurchase')
            .withArgs(user.address, amount)
    });
});
