// import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";
// Create ethers-5.1.esm.min.js from
//      https://docs.ethers.org/v5/getting-started/
//          Web Browser "copy the ethers library"
//      https://cdn.ethers.io/lib/ethers-5.1.esm.min.js
import { ethers } from "./ethers-5.1.esm.min.js"
import { ABI, contractAddress } from "./constants.js"

const btnConnect = document.getElementById("btnConnect")
btnConnect.onclick = connect
const btnFund = document.getElementById("btnFund")
btnFund.onclick = fund
const btnGetBalance = document.getElementById("btnGetBalance")
btnGetBalance.onclick = getBalance
const btnWithdraw = document.getElementById("btnWithdraw")
btnWithdraw.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see metamask!")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected")
        btnConnect.innerHTML = "Connected"
    } else {
        btnConnect.innerHTML = "Please install MetaMask"
    }
}

// fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // Provider - connection to a blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // Signer - a wallet with gas
        const signer = provider.getSigner()
        // Contract - ABI and address
        const contract = new ethers.Contract(contractAddress, ABI, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount)
            })
            // listen for the tx to be mined
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

// withdraw function
async function withdraw() {
    console.log(`Withdrawing Funds`)
    if (typeof window.ethereum !== "undefined") {
        // Provider - connection to a blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // Signer - a wallet with gas
        const signer = provider.getSigner()
        // Contract - ABI and address
        const contract = new ethers.Contract(contractAddress, ABI, signer)

        const StartBalance = await provider.getBalance(contractAddress)
        console.log(`Withdrawing ${ethers.utils.formatEther(StartBalance)} ETH`)

        try {
            const transactionResponse = await contract.withdraw()
            // listen for the tx to be mined
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // Listen for this transacion to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, transactionReceipt => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}
//

// withdraw function
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        // Provider - connection to a blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}
