require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const { task } = require("hardhat/config")
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()
    for (const account of accounts) {
        console.log(account.address)
    }
})

const RPC_URL_ALCHEMY_GOERLI =
    process.env.RPC_URL_ALCHEMY_GOERLI || "https://eth-goerli"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "API_key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "API_key"

// Extract Private Key from encrypted key file or dotenv
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xKey"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: RPC_URL_ALCHEMY_GOERLI,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
            blockConfirmations: 1
        }
    },
    // The solidity compilers is a list of compilers needed based on actual and imported contracts
    solidity: {
        compilers: [{ version: "0.8.17" }, { version: "0.6.6" }]
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0
        },
        user: {
            default: 1
        }
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        token: "ETH",
        // token: "MANTIC",
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY
    }
}
