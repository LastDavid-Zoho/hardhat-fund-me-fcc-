const { getNamedAccounts, ethers, network } = require("hardhat")

const WAIT_CONFIRMATIONS = network.config.blockConfirmations || 1

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    let contractBalance = await fundMe.provider.getBalance(fundMe.address)
    console.log(`Contract Funded with ${contractBalance.toString()}`)
    console.log("Withdraw funds from contract...")
    const deployerBalanceStarting = await fundMe.provider.getBalance(deployer)
    const transactionResponse = await fundMe.withdraw()
    const transactionReceipt = await transactionResponse.wait(
        WAIT_CONFIRMATIONS
    )

    const deployerBalanceEnding = await fundMe.provider.getBalance(deployer)
    contractBalance = await fundMe.provider.getBalance(fundMe.address)
    const { gasUsed, effectiveGasPrice } = transactionReceipt
    const gasCost = gasUsed.mul(effectiveGasPrice)
    console.log(`Contract Funded with ${contractBalance.toString()}`)
    console.log(`Deployer Address: ${deployer}`)
    console.log(`Starting Balance: ${deployerBalanceStarting}`)
    console.log(`Ending Balance  : ${deployerBalanceEnding}`)
    console.log(`        Gas Cost: ${gasCost}`)
    console.log("-------------------")
    //console.log("Transaction Receipt")
    //console.log(transactionReceipt)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
