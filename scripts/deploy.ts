import { ethers } from "hardhat";
import { deploy } from "./deploy_utils";

async function main() {
  // console.log("Starting deployment on network id: " + ethers.provider.network.chainId);
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
