const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { etherScanVerify } = require("../utils/etherScanVerify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        mockEthUsdPriceFeedAggregator = await deployments.get(
            "MockV3Aggregator"
        )
        ethUsdPriceFeedAddress = mockEthUsdPriceFeedAggregator.address
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[chainId]["ethUsdPriceFeedAddress"]
    }

    const deployFundMeArgs = [ethUsdPriceFeedAddress]
    const waitConfirmations = network.config.blockConfirmations || 1
    console.log(
        "Waiting " + waitConfirmations.toString() + " blocks for confirmation"
    )
    console.log("-- Deployer -->")
    console.log(deployer)
    console.log("<-- Deployer --")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: deployFundMeArgs,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        console.log("Posting etherScan Verification")
        await etherScanVerify(fundMe.address, deployFundMeArgs)
    }

    log(" --------------------------------------------- ")
}

module.exports.tags = ["all", "fundme"]
