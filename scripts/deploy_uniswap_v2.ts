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

import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {
    ERC20PresetMinterPauser__factory,
    SwapboxUniswapV2,
    SwapboxUniswapV2__factory,
    UniswapV2Factory,
    UniswapV2Factory__factory,
    UniswapV2Pair,
    UniswapV2Pair__factory,
    UniswapV2Router02,
    UniswapV2Router02__factory
} from "../typechain";
import {ERC20PresetMinterPauser} from "../typechain/ERC20PresetMinterPauser";
import {BigNumber} from "ethers";
import {longDeadline} from "../test/utils";
import {ethers, tracer} from "hardhat";

export const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export interface UniswapEnv {
    factory: UniswapV2Factory,
    router: UniswapV2Router02
    pair: UniswapV2Pair,
}

/**
 * Deploy a uniswap factory, token pair and exchange.
 *
 * @param deployer  Account for deployment/owner.
 * @param tokenStable Address of backing token.
 * @param amountETH
 * @param amountStable
 */
export async function deployUniswapV2(
    deployer: SignerWithAddress,
    tokenStable: ERC20PresetMinterPauser,
    amountETH: BigNumber = ethers.utils.parseEther("10"),
    amountStable: BigNumber = ethers.utils.parseEther("20000"),
): Promise<UniswapEnv> {
    const factory = await (new UniswapV2Factory__factory(deployer)).deploy(deployer.address);
    const router = await (new UniswapV2Router02__factory(deployer)).deploy(
        factory.address,
        WETH_ADDRESS
    );

    const tx = await factory.createPair(tokenStable.address, WETH_ADDRESS);
    const m = await tx.wait();
    const basePairAddress = m.events![0].args!['pair'];
    const pair = UniswapV2Pair__factory.connect(basePairAddress, deployer);


    await addLiquidity(deployer, amountETH, amountStable, tokenStable, router);

    // tags external contracts when tracer is enabled
    tracer.nameTags[router.address] = "UniswapV2Router02";
    tracer.nameTags[factory.address] = "UniswapV2Factory";
    tracer.nameTags[pair.address] = "UniswapV2Pair";

    return {
        factory: factory,
        router: router,
        pair: pair
    }
}

/**
 * Get some WETH and stable coins and adds liquidity to the pair
 *
 * @param deployer
 * @param amountETH
 * @param amountStable
 * @param tokenStable
 * @param router
 */
export async function addLiquidity(
    deployer: SignerWithAddress,
    amountETH: BigNumber,
    amountStable: BigNumber,
    tokenStable: ERC20PresetMinterPauser,
    router: UniswapV2Router02,
) {
    await tokenStable.mint(deployer.address, amountStable);
    await tokenStable.approve(router.address, amountStable);

    await router.addLiquidityETH(
        tokenStable.address,
        amountStable,
        amountStable,
        amountETH,
        deployer.address,
        await longDeadline(),
        {
            value: amountETH
        }
    )

}


/**
 * Deploy Swapbox contract for UniswapV2 environment. Mints 100.0 Stable coin on
 * swapbox address.
 *
 * @param deployer  Deployer of the contract, owner.
 * @param baseToken Stable coin backing up Swapbox fiat.
 * @param wethToken Wrapped ETH address
 * @param factory   UniswapV2Factory address
 * @param router    UniswapV2Router02 address
 */
export async function deploySwapboxUniswapV2(
    deployer: SignerWithAddress,
    baseToken: string,
    wethToken: string,
    factory: string,
    router: string,
): Promise<SwapboxUniswapV2> {
    const defaultMint = ethers.utils.parseEther("100.0");

    const swapbox = await (new SwapboxUniswapV2__factory(deployer)).deploy(
        baseToken,
        wethToken,
        factory,
        router
    );
    const token = ERC20PresetMinterPauser__factory.connect(baseToken, deployer);
    await token.mint(swapbox.address, defaultMint);

    return swapbox;
}
