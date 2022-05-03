import Web3 from "web3"
import Big from "big.js"
import fs from "fs"

const LP_ABI_PATH = __dirname + "/../abi/lp.json"
const BOND_ABI_PATH = __dirname + "/../abi/bond.json"

const BOND_ADDESS = "0xd0Ed146951A189e3288d31aC815cabA619D56143"
const DEUS_FTM_LP_ADDRESS = "0xaF918eF5b9f33231764A5557881E6D3e5277d456"
const FTM_USDC_LP_ADDRESS = "0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c"

export class PriceFeed {
    constructor(private web3: Web3) {}

    async getDeusPrice(): Promise<number> {
        const lpAbi = JSON.parse(fs.readFileSync(LP_ABI_PATH).toString())
        const deusFtmLp = new this.web3.eth.Contract(lpAbi, DEUS_FTM_LP_ADDRESS)
        const ftmUsdcLp = new this.web3.eth.Contract(lpAbi, FTM_USDC_LP_ADDRESS)

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

    async getBondPrice(): Promise<number> {
        const bondAbi = JSON.parse(fs.readFileSync(BOND_ABI_PATH).toString())
        const bond = new this.web3.eth.Contract(bondAbi, BOND_ADDESS)

        const price = await bond.methods.trueBondPrice().call()

        return Big(price).div("1e7").toNumber()
    }
}
