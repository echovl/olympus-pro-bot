import Web3 from "web3"
import Big from "big.js"
import fs from "fs"

const ORACLE_ABI_PATH = __dirname + "/../abi/oracle.json"
const ORACLE_ADDRESS = "0x65DbF8875d0f1DD5C9876055b8E24706642DDC29"
const ORACLE_ABI = JSON.parse(fs.readFileSync(ORACLE_ABI_PATH).toString())

export class PriceFeed {
    oracle = new this.web3.eth.Contract(ORACLE_ABI, ORACLE_ADDRESS)

    constructor(private web3: Web3) {}

    async getDeusPrice(): Promise<number> {
        const price = await this.oracle.methods.getDeusPrice().call()

        return Big(price).toNumber()
    }

    async getBondPrice(): Promise<number> {
        const price = await this.oracle.methods.getBondPrice().call()

        return Big(price).toNumber()
    }
}
