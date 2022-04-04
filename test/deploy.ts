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
import {expect, use} from 'chai';
import {solidity} from 'ethereum-waffle';
import {ethers} from "hardhat";
import {deploySwapbox, deployToken, deployUniswapEnv} from "../scripts/deploy_utils";
import {Swapbox} from '../typechain';

use(solidity);

describe('Deploy setup', () => {
    let deployer: SignerWithAddress;

    let swapbox: Swapbox;

    beforeEach(async () => {
        [deployer] = await ethers.getSigners();

    });

    it('should deploy a uniswap environment', async () => {
        const d = await deployUniswapEnv(deployer);
        expect(d.exchange.address).to.not.be.empty;
        expect(d.tokenXCHF.address).to.not.be.empty;
        expect(d.tokenETH.address).to.not.be.empty;
    });

    it('should deployed swapbox', async () => {
        const d = await deployUniswapEnv(deployer);
        swapbox = await deploySwapbox(deployer, d);
        expect(swapbox.address).not.to.be.empty;
    });

    it('should deploy an ERC20 token', async () => {
        const token = await deployToken(deployer, "Test Token", "TTK");
        expect(token.address).not.to.be.empty;
        expect(await token.name()).to.equal("Test Token");
        expect(await token.symbol()).to.equal("TTK");
        expect(await token.totalSupply()).to.equal(0);
    });
});
