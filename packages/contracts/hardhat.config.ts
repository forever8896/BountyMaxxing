import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    zgTestnet: {
      url: process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: process.env.ZG_PRIVATE_KEY ? [process.env.ZG_PRIVATE_KEY] : [],
    },
    zgMainnet: {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: process.env.ZG_PRIVATE_KEY ? [process.env.ZG_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      zgTestnet: "not-needed",
    },
    customChains: [
      {
        network: "zgTestnet",
        chainId: 16602,
        urls: {
          apiURL: "https://chainscan-galileo.0g.ai/open/api",
          browserURL: "https://chainscan-galileo.0g.ai",
        },
      },
    ],
  },
};

export default config;
