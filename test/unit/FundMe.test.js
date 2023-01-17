const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

const WAIT_CONFIRMATIONS = network.config.blockConfirmations || 1

// Skip if on a development chain
if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("FundMe", function() {
        const ONE_ETH = ethers.utils.parseEther("1") // better than fundvalue = 1 * 10**18 or = 1_000_000_000_000_000_000

        let fundMe
        let deployer
        let mockV3Aggregator
        this.beforeEach(async function() {
            // deploy contracts using Hardhat-deploy and any necessary tags
            //   this is the same as typing yarn hardhat deploy --tags all
            // const accounts = await ethers.getSigners()
            // const accountZero = accounts[0]
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract(
                "MockV3Aggregator",
                deployer
            )
        })

        describe("constructor", function() {
            it("sets the aggrator address correctly", async () => {
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("fund", function() {
            // Test the require statement
            it("Fails (reverts) if you do not send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "You need to spend more ETH!"
                )
            })

            // Test the fund function operations
            it("Updates the addressToAmountFunded structure", async () => {
                await fundMe.fund({ value: ONE_ETH })
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), ONE_ETH.toString())
            })
            it("Adds funder to array of funders", async () => {
                await fundMe.fund({ value: ONE_ETH })
                // The contract is reset before each test
                //   so even if another test runs fundMe.fund when this test runs the index for the funder is Zero
                const response = await fundMe.getFunders(0)
                assert.equal(response, deployer)
            })
        })

        describe("withdraw", function() {
            // Before Each Test (it) fund the contract
            this.beforeEach(async () => {
                await fundMe.fund({ value: ONE_ETH })
            })

            it("Only allows the owner to withdraw", async () => {
                // Test the onlyOwner modifier
                //   Get an list of accounts
                const accounts = await ethers.getSigners()
                //   Account Zero is the Deployer\Owner in this case
                const attacker = accounts[1]
                //   Create a handel for the contract using the attackers address
                const attacker_fundMe = await fundMe.connect(attacker)
                await expect(
                    attacker_fundMe.withdraw()
                ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
            })

            it("Withdraw ETH with a single funder", async () => {
                // Arrange - Setup the Test - Assign Variables and Run any necessary functions
                const startingBalanceFundMe = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const startingBalanceDeployer = await fundMe.provider.getBalance(
                    deployer
                )

                // Act - Execute the Test - Run the function under test and capture the results
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(
                    WAIT_CONFIRMATIONS
                )

                // Calculate Gas Cost = Units of Gas Used * Gas Price (wei per gas unit)
                //      Gas Used and Price are elements of the transactionReceipt object and they are bigNumbers
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const EndingBalanceFundMe = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const EndingBalanceDeployer = await fundMe.provider.getBalance(
                    deployer
                )

                // Assert - Check the Test - Run assert or expect to verify the results
                assert.equal(EndingBalanceFundMe, 0)
                assert.equal(
                    startingBalanceDeployer
                        .add(startingBalanceFundMe)
                        .toString(),
                    EndingBalanceDeployer.add(gasCost).toString()
                )
            })

            it("Withdraw ETH with multiple funders", async () => {
                // Arrange

                // Fund with multiple accounts
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: ONE_ETH })
                }
                // Get staring balances
                const startingBalanceFundMe = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const startingBalanceDeployer = await fundMe.provider.getBalance(
                    deployer
                )

                // Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(
                    WAIT_CONFIRMATIONS
                )

                // Calculate Gas Cost = Units of Gas Used * Gas Price (wei per gas unit)
                //      Gas Used and Price are elements of the transactionReceipt object and they are bigNumbers
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const EndingBalanceFundMe = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const EndingBalanceDeployer = await fundMe.provider.getBalance(
                    deployer
                )

                // Assert

                // Verify that Contact and Deployer balances adjusted correctly
                assert.equal(EndingBalanceFundMe, 0)
                assert.equal(
                    startingBalanceDeployer
                        .add(startingBalanceFundMe)
                        .toString(),
                    EndingBalanceDeployer.add(gasCost).toString()
                )

                // Verify that the array of funders has been cleared by calling the value of the first index - this should error\revert
                await expect(fundMe.getFunders(0)).to.be.reverted

                // Verify that mapping of funders has zeroed their balances
                for (i = 1; i < 6; i++) {
                    assert.equal(
                        await fundMe.getAddressToAmountFunded(
                            accounts[i].address
                        ),
                        0
                    )
                }
            })
        })
    })
}
