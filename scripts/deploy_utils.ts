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

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "ethers";
import { CryptoFranc, Swapbox, CryptoFranc__factory, Swapbox__factory } from "../typechain";
import { UniswapV2Pair, ERC20, UniswapV2Factory__factory, ERC20__factory, UniswapV2Pair__factory } from "../typechain";


// Deployment
export class Deployment {
  uniswapExchange: UniswapV2Pair;
  tokenXCHF: CryptoFranc;
  tokenETH: ERC20;
  swapbox: Swapbox;

  constructor(
    uniswapExchange: UniswapV2Pair,
    tokenXCHF: CryptoFranc,
    tokenETH: ERC20,
    swapbox: Swapbox
  ) {
    this.uniswapExchange = uniswapExchange;
    this.tokenXCHF = tokenXCHF;
    this.tokenETH = tokenETH;
    this.swapbox = swapbox;
  }

  public toString(): string {
    return `pair:\t${this.uniswapExchange.address}\nXCHF:\t${this.tokenXCHF.address}\nWETH:\t${this.tokenETH.address}\nswapBox:\t${this.swapbox.address}`;
  }
}

export async function deploy(deployer: SignerWithAddress): Promise<Deployment> {
  // uniswap factory
  const uniswapFactory = await (new UniswapV2Factory__factory(deployer)).deploy(
    deployer.address
  );

  // tokens
  const tokenETH = await (new ERC20__factory(deployer)).deploy(
    ethers.utils.parseEther("1000"),
  );
  const tokenXCHF = await (new CryptoFranc__factory(deployer)).deploy(
    "CryptoFranc",
    ethers.utils.parseEther("0.01")
  );

  // create uniswap pair
  const tx = await uniswapFactory.createPair(tokenXCHF.address, tokenETH.address);
  const receipt = await tx.wait();
  if (receipt.events === undefined || receipt.events[0].args === undefined) {
    throw new Error("Failed to create uniswap pair");
  }
  const pairAddress = receipt.events[0].args[2];
  const uniswapExchange = UniswapV2Pair__factory.connect(pairAddress, deployer);

  const swapBox = await (new Swapbox__factory(deployer)).deploy(tokenXCHF.address, pairAddress);

  return new Deployment(uniswapExchange, tokenXCHF, tokenETH, swapBox);
}
