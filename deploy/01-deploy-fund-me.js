// import
// main function - not in hardhat
// calling of main function - not in hardhat

// When we run hardhat deploy, hardhat deploy is going to call a function that we specify in this script

// We are going to export this deployFunc() as the default function for hardhat deploy to look for

// ##### SINTAX BELOW NAMING THE FUNCTION ###
// function deployFunc() {
//     console.log("Hi!")
// }
// module.exports.default = deployFunc

// ##### SINTAX BELOW WITH ANNONYMOUS FUNCTION (hre is the hardhat runtime environment) #####
// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre}

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

// ##### VERSION WITH JAVASCRIPT SYNTACTIC SUGAR BELOW #####
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // if chainId is X use address Y
    // if chainId is Z use address A

    // const ethUsdPriceFeedAdress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // verify
        await verify(fundMe.address, args)
    }

    log("-----------------------------------------")
}

module.exports.tags = ["all", "fundme"]
