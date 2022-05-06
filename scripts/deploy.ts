import { ethers } from "hardhat"

async function main() {
    const Oracle = await ethers.getContractFactory("Oracle")
    const oracle = await Oracle.deploy()

    await oracle.deployed()

    console.log("Oracle deployed to:", oracle.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
