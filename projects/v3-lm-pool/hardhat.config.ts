import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@typechain/hardhat'
import 'dotenv/config'
import { NetworkUserConfig } from 'hardhat/types'
import 'solidity-docgen';
require('dotenv').config({ path: require('find-config')('.env') })

const bscTestnet: NetworkUserConfig = {
  url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  chainId: 97,
  accounts: [process.env.KEY_TESTNET!],
}

const bscMainnet: NetworkUserConfig = {
  url: 'https://bsc-dataseed.binance.org/',
  chainId: 56,
  accounts: [process.env.KEY_MAINNET!],
}

const goerli: NetworkUserConfig = {
  url: 'https://rpc.ankr.com/eth_goerli',
  chainId: 5,
  accounts: [process.env.KEY_GOERLI!],
}

const eth: NetworkUserConfig = {
  url: 'https://eth.llamarpc.com',
  chainId: 1,
  accounts: [process.env.KEY_ETH!],
}

const arb_sepolia: NetworkUserConfig = {
  url: 'https://arbitrum-sepolia.infura.io/v3/1c177df366ef47b689e8b84ee6c7297d',
  chainId: 421614,
  accounts: [process.env.KEY_ARB_SEPOLIA!],
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.6',
  },
  networks: {
    hardhat: {},
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_ETH && { eth }),
    ...(process.env.KEY_ARB_SEPOLIA && { arb_sepolia }),
  },
  etherscan: {
    apiKey: { arb_sepolia: process.env.ETHERSCAN_API_KEY || '' },
    customChains: [
      {
        network: "arb_sepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
    ],
  },
  paths: {
    sources: './contracts/',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}

export default config
