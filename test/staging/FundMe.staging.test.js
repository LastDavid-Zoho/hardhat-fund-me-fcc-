const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

const WAIT_CONFIRMATIONS = network.config.blockConfirmations || 1

// Skip if on a development chain
if (developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("FundMe", function() {
        let deployer
        let fundMe
        const sendValue = ethers.utils.parseEther("0.1")
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allows people to fund and withdraw", async function() {
            const fundTxResponse = await fundMe.fund({ value: sendValue })
            await fundTxResponse.wait(WAIT_CONFIRMATIONS1)
            const withdrawTxResponse = await fundMe.withdraw()
            await withdrawTxResponse.wait(WAIT_CONFIRMATIONS)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            console.log(
                endingFundMeBalance.toString() +
                    " should equal 0, running assert equal..."
            )
            assert.equal(endingFundMeBalance.toString(), "0")
        })
    })
}
