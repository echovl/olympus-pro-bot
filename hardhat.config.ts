import { task, HardhatUserConfig } from "hardhat/config"
import dotenv from "dotenv"
import "@nomiclabs/hardhat-waffle"

// Make sure env variables are loaded
dotenv.config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(await account.address)
    }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.0",
            },
            {
                version: "0.7.0",
            },
        ],
    },
    networks: {
        ftm: {
            url: process.env.FANTOM_RPC_HTTP,
            accounts: [process.env.PRIVATE_KEY as string],
            chainId: 250,
        },
    },
}

export default config
