import Web3 from "web3"
import fs from "fs"
import { config } from "dotenv"
import Big from "big.js"

config()

const LP_ABI_PATH = __dirname + "/../abi/lp.json"
const BOND_ABI_PATH = __dirname + "/../abi/bond.json"

const BOND_ADDESS = "0xd0Ed146951A189e3288d31aC815cabA619D56143"
const DEUS_FTM_LP_ADDRESS = "0xaF918eF5b9f33231764A5557881E6D3e5277d456"
const FTM_USDC_LP_ADDRESS = "0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c"

const FANTOM_RPC_URL = process.env.FANTOM_RPC_URL as string

const web3 = new Web3(FANTOM_RPC_URL)

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms)
    })
}

async function run() {
    web3.eth
        .subscribe("newBlockHeaders")
        .on("connected", console.log)
        .on("data", async (blockHeader) => {
            if (blockHeader.number) {
                const marketPrice = await getDeusPrice()
                const bondPrice = await getBondPrice()
                const roi = (100 * (marketPrice - bondPrice)) / bondPrice

                console.clear()
                console.log("TOKEN: DEUS")
                console.log(`MARKET PRICE: $${marketPrice.toFixed(2)}`)
                console.log(`BOND PRICE: $${bondPrice.toFixed(2)}`)
                console.log(`ROI: ${roi.toFixed(2)}%`)
            }
        })

    await sleep(100000000)
}

async function getDeusPrice(): Promise<number> {
    const lpAbi = JSON.parse(fs.readFileSync(LP_ABI_PATH).toString())
    const deusFtmLp = new web3.eth.Contract(lpAbi, DEUS_FTM_LP_ADDRESS)
    const ftmUsdcLp = new web3.eth.Contract(lpAbi, FTM_USDC_LP_ADDRESS)

    const deusFtmLpReserves = await deusFtmLp.methods.getReserves().call()
    const ftmReserve1 = new Big(deusFtmLpReserves._reserve0)
    const deusReserve = new Big(deusFtmLpReserves._reserve1)

    const deusFtmPrice = ftmReserve1.div(deusReserve)

    const ftmUsdcLpReserves = await ftmUsdcLp.methods.getReserves().call()
    const usdcReserve = new Big(ftmUsdcLpReserves._reserve0)
    const ftmReserve2 = new Big(ftmUsdcLpReserves._reserve1)

    const ftmUsdcPrice = usdcReserve.div(ftmReserve2).mul("1e12")

    return deusFtmPrice.mul(ftmUsdcPrice).toNumber()
}

async function getBondPrice(): Promise<number> {
    const bondAbi = JSON.parse(fs.readFileSync(BOND_ABI_PATH).toString())
    const bond = new web3.eth.Contract(bondAbi, BOND_ADDESS)

    const price = await bond.methods.trueBondPrice().call()

    return Big(price).div("1e7").toNumber()
}

run()
