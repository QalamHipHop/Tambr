import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // Fix for pnpm monorepo
      libraries: {},
      outputSelection: {},
      metadata: {
        bytecodeHash: "none",
      },
      evmVersion: "istanbul",
      viaIR: true,

    },

  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources: "./src/contracts",
    tests: "./src/tests",
    artifacts: "./artifacts",
    cache: "./cache",
  },
};

export default config;
