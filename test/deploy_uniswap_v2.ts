// Swapbox
// Copyright (C) 2022  TrueLevel SA
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
import {expect} from 'chai';
import {ethers} from "hardhat";
import {deployMintableToken} from "../scripts/deploy";
import {ERC20, ERC20__factory} from '../typechain';
import {deploySwapboxUniswapV2, deployUniswapV2, UniswapEnv, WETH_ADDRESS} from "../scripts/deploy_uniswap_v2";
import {ERC20PresetMinterPauser} from '../typechain/ERC20PresetMinterPauser';


describe('Deploy setup', () => {
    let deployer: SignerWithAddress;
    let machine: SignerWithAddress;
    let tokenWETH: ERC20;
    let tokenStable: ERC20PresetMinterPauser;
    let uniswap: UniswapEnv;

    before(async () => {
        [deployer, machine] = await ethers.getSigners();
        tokenWETH = ERC20__factory.connect(WETH_ADDRESS, deployer);
        tokenStable = await deployMintableToken(deployer, "Random Stable Coin", "RSC");
        uniswap = await deployUniswapV2(deployer, tokenStable);
    });

    it('should deploy test tokens', async () => {
        expect(tokenWETH.address).to.not.be.empty;
        expect(await tokenWETH.name()).to.equal("Wrapped Ether");
        expect(await tokenWETH.symbol()).to.equal("WETH");
        expect(tokenStable.address).to.not.be.empty;
    });

    it('should set factory and router addresses', async () => {
        expect(uniswap.factory.address).to.be.properAddress;
        expect(uniswap.router.address).to.be.properAddress;
    });

    it('should set factory address on router', async () => {
        expect(await uniswap.router.factory()).to.equal(uniswap.factory.address);
    });

    it('should correctly set WETH address on router', async () => {
        expect(await uniswap.router.WETH()).to.equal(WETH_ADDRESS);
    });

    it('should have a pair for WETH-Stable', async () => {
        const pairAddress = await uniswap.factory.getPair(tokenWETH.address, tokenStable.address);
        expect(pairAddress).to.be.properAddress;
        expect(pairAddress).to.not.equal(ethers.constants.AddressZero);
        expect(pairAddress).to.equal(uniswap.pair.address);

        const token0 = await uniswap.pair.token0();
        const token1 = await uniswap.pair.token1();

        if (tokenStable.address < tokenWETH.address) {
            expect(token0).to.equal(tokenStable.address);
            expect(token1).to.equal(tokenWETH.address);
        } else {
            expect(token0).to.equal(tokenWETH.address);
            expect(token1).to.equal(tokenStable.address);
        }
    });

    it('should have liquidity for the base pair', async () => {
        const [reserve0, reserve1] = await uniswap.pair.getReserves();

        if (tokenStable.address < tokenWETH.address) {
            expect(reserve0).to.equal(ethers.utils.parseEther("20000"));
            expect(reserve1).to.equal(ethers.utils.parseEther("10"));
        } else {
            expect(reserve0).to.equal(ethers.utils.parseEther("10"));
            expect(reserve1).to.equal(ethers.utils.parseEther("20000"));
        }
    });

    it('should deploy swapbox - uniswap v2', async () => {
        const swapbox = await deploySwapboxUniswapV2(
            deployer,
            tokenStable.address,
            tokenWETH.address,
            uniswap.factory.address,
            uniswap.router.address,
        );
        expect(swapbox.address).to.be.properAddress;
    });
});
