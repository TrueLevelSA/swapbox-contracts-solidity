import {ethers} from "hardhat";

export async function longDeadline(): Promise<number> {
    return (await ethers.provider.getBlock(ethers.provider.blockNumber)).timestamp + 100000;
}
