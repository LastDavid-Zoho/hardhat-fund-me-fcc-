const { ether } = require("hardhat")
const fs = require("fs-extra")
require("dotenv").config()

async function decrypt() {
    // PRIVATE_KEY_PASSWORD needs to be provided at the bash terminal
    try {
        const PRIVATE_KEY_PASSWORD = process.env.PRIVATE_KEY_PASSWORD
        console.log(`PRIVATE_KEY_PASSWORD: ${PRIVATE_KEY_PASSWORD}`)

        const encryptedJson = fs.readFileSync("../.encryptedKey.json", "utf8")
        console.log(" --- Encrypted json Object --->")
        console.log(encryptedJson)
        console.log("<--- Encrypted json Object ---")

        console.log("Decrypting the Key...")
        const wallet = new ethers.Wallet.fromEncryptedJsonSync(
            encryptedJson,
            PRIVATE_KEY_PASSWORD
        )
        const privateKey = wallet._signingKey()
        const privateKeyValue = privateKey.privateKey
        console.log(`PRIVATE_KEY: ${privateKeyValue}`)
        return privateKeyValue
    } catch {
        console.log("Decrypt Error: Unable to Decrypt Key File")
        console.log("Error Message:")
        console.log(error)
        return false
    }
}

async function encrypt() {
    const PRIVATE_KEY_PASSWORD = process.env.PRIVATE_KEY_PASSWORD
    const PRIVATE_KEY = process.env.PRIVATE_KEY
    console.log(`PRIVATE_KEY: ${PRIVATE_KEY}`)
    console.log(`PRIVATE_KEY_PASSWORD: ${PRIVATE_KEY_PASSWORD}`)
    console.log("Encrypting the Key...")

    const wallet = new ethers.Wallet(PRIVATE_KEY)
    const encryptedJson = await wallet.encrypt(
        PRIVATE_KEY_PASSWORD,
        PRIVATE_KEY
    )

    fs.writeFileSync("../.encryptedKey.json", encryptedJson)
    console.log(" --- Encrypted json Object --->")
    console.log(encryptedJson)
    console.log("<--- Encrypted json Object ---")
}

// Only execute code if not imported\required as a module
if (typeof require !== "undefined" && require.main === module) {
    encrypt()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
}

module.exports = { decrypt }
