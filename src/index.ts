import Web3 from "web3"
import { config } from "dotenv"
import { TelegramBot } from "./bot"
import { PriceFeed } from "./price"
import Express from "express"

config()

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string
const FANTOM_RPC_URL = process.env.FANTOM_RPC_URL as string

async function calculateCurrentRoi(priceFeed: PriceFeed): Promise<number> {
    const marketPrice = await priceFeed.getDeusPrice()
    const bondPrice = await priceFeed.getBondPrice()
    return (100 * (marketPrice - bondPrice)) / bondPrice
}

async function run() {
    const web3 = new Web3(FANTOM_RPC_URL)
    const bot = new TelegramBot(TELEGRAM_BOT_TOKEN)
    const priceFeed = new PriceFeed(web3)
    const app = Express()

    const suscription = web3.eth.subscribe("newBlockHeaders")

    app.post("/start", (_, res) => {
        suscription.subscribe().on("data", async (blockHeader) => {
            if (blockHeader.number) {
                const roi = await calculateCurrentRoi(priceFeed)

                console.log(`ROI: ${roi}`)

                bot.publish(roi)
            }
        })
        res.send("Done")
    })

    app.post("/stop", (_, res) => {
        suscription.subscribe()
        res.send("Done")
    })

    app.listen(3000)
}

run()
