const { decrypt } = require("./Key_Encryption")

async function main() {
    console.log("Decrypt Test")
    decrypt()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
