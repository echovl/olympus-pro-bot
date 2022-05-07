import { ethers } from "hardhat"

const CUSTOM_BOND = "0xd0Ed146951A189e3288d31aC815cabA619D56143"
const VAULT = "0x20dd72ed959b6147912c2e529f0a0c651c33c9ce"
const DEUS = "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44"
const DEI = "0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3"
const POOL_ID =
    "0x0e8e7307e43301cf28c5d21d5fd3ef0876217d410002000000000000000003f1"

async function main() {
    const BondZapper = await ethers.getContractFactory(
        "contracts/BondZapperFlatten.sol:BondZapper"
    )
    const bondZapper = await BondZapper.deploy(
        CUSTOM_BOND,
        VAULT,
        DEUS,
        DEI,
        POOL_ID
    )

    await bondZapper.deployed()

    console.log("BondZapper deployed to:", bondZapper.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
