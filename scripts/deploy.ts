import { ethers, run } from "hardhat";
import { Atola, Atola__factory } from "../typechain";
import { CryptoFranc, CryptoFranc__factory } from "../typechain";

import { ERC20, ERC20__factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory } from "../typechain-extra";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


// Deployment
export class Deployment {
  uniswapExchange: UniswapV2Pair;
  tokenXCHF: CryptoFranc;
  tokenETH: ERC20;
  atola: Atola;

  constructor(
    uniswapExchange: UniswapV2Pair,
    tokenXCHF: CryptoFranc,
    tokenETH: ERC20,
    atola: Atola
  ) {
    this.uniswapExchange = uniswapExchange;
    this.tokenXCHF = tokenXCHF;
    this.tokenETH = tokenETH;
    this.atola = atola;
  }

  public toString(): string {
    return `pair:\t${this.uniswapExchange.address}\nXCHF:\t${this.tokenXCHF.address}\nWETH:\t${this.tokenETH.address}\natola:\t${this.atola.address}`;
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

  // atola
  const atola = await (new Atola__factory(deployer)).deploy(tokenXCHF.address, pairAddress);

  return new Deployment(uniswapExchange, tokenXCHF, tokenETH, atola);
}

async function main() {
  await run("compile");

  console.log("Starting deployment on network: " + ethers.provider.network);
  const [deployer] = await ethers.getSigners()
  const deployment = await deploy(deployer);
  console.log("" + deployment);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
