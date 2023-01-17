const { getNamedAccounts, ethers, network } = require("hardhat")

const WAIT_CONFIRMATIONS = network.config.blockConfirmations || 1

const fundingAmount = ethers.utils.parseEther("0.1")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding Contract...")

    const transactionResponse = await fundMe.fund({ value: fundingAmount })
    const transactionReceipt = await transactionResponse.wait(
        WAIT_CONFIRMATIONS
    )
    const contractBalance = await fundMe.provider.getBalance(fundMe.address)
    console.log(`Contract Funded with ${contractBalance.toString()}`)
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
