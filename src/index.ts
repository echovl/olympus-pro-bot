import Web3 from "web3"
import { config } from "dotenv"
import { TelegramBot } from "./bot"
import { PriceFeed } from "./price"
import Express from "express"
import cron from "node-cron"

config()

const APP_PORT = 3000
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string
const FANTOM_RPC_URL = process.env.FANTOM_RPC_URL as string
const UPDATE_RATE = process.env.UPDATE_RATE as string

async function calculateCurrentRoi(priceFeed: PriceFeed): Promise<number> {
    const marketPrice = await priceFeed.getDeusPrice()
    const bondPrice = await priceFeed.getBondPrice()
    return (100 * (marketPrice - bondPrice)) / bondPrice
}

async function run() {
    const wss = new Web3.providers.WebsocketProvider(FANTOM_RPC_URL, {
        reconnect: {
            auto: true,
            delay: 5000,
            maxAttempts: 5,
            onTimeout: false,
        },
    })

    const web3 = new Web3(wss)
    const bot = new TelegramBot(TELEGRAM_BOT_TOKEN)
    const priceFeed = new PriceFeed(web3)
    const app = Express()

    const job = cron.schedule(`*/${UPDATE_RATE} * * * *`, async () => {
        const block = await web3.eth.getBlockNumber()
        const roi = await calculateCurrentRoi(priceFeed)

        console.log(`Block: ${block}, ROI: ${roi}`)

        bot.publish(roi)
    })

    app.post("/start", (_, res) => {
        job.start()
        res.send("Done")
    })

    app.post("/stop", (_, res) => {
        job.stop()
        res.send("Done")
    })

    app.listen(APP_PORT, () =>
        console.log(`Server running at port ${APP_PORT}`)
    )
}

run().catch(console.error)
