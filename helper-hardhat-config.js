const networkConfig = {
    5: {
        // Goerli - Ethereum Testnet
        name: "goerli",
        // ChainLink Price Feed Address (https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum)
        ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    },
    137: {
        // Polygon Mainnet (Ethereum L2)
        name: "polygon",
        // ChainLink Price Feed Address (https://docs.chain.link/data-feeds/price-feeds/addresses?network=polygon)
        ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    }
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200_000_000_000 //2000 USD = 1 Eth

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
