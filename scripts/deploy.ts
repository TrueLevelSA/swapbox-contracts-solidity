import { ethers } from "hardhat";

async function main() {
  console.log(ethers);
  
  console.log(ethers.provider.network);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
