import { HardhatUserConfig } from "hardhat/config";
import "hardhat-docgen";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'

const config: HardhatUserConfig = {
    docgen: {
        path: './docs',
        clear: true,
        runOnCompile: true,
    },
    solidity: {
        compilers: [
            {
                version: "0.4.25",
            },
            {
                version: "0.8.9"
            }
        ],
    },
    typechain: {
        externalArtifacts: [
            "./node_modules/@uniswap/v2-core/build/!(Combined-Json)*.json"
        ],
        outDir: "./typechain"
    }
};

export default config;
