import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.5.8",
            },
            {
                version: "0.4.25",
            }
        ],
    }
};

export default config;
