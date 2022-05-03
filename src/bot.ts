import Telegram from "node-telegram-bot-api"

const START_REGEX = /\/start/
const SUSCRIBE_REGEX = /\/suscribe (.+)/

const startMessage = `You can control me by sending these commands:

    /suscribe [roi_target] - suscribe to roi notifications
`
interface Suscriber {
    chatId: number
    roiTarget: number
}

export class TelegramBot {
    private client: Telegram
    private suscribers: Suscriber[]

    constructor(token: string) {
        this.client = new Telegram(token, { polling: true })
        this.suscribers = []

        this.client.onText(START_REGEX, this.startCallback.bind(this))
        this.client.onText(SUSCRIBE_REGEX, this.suscribeCallback.bind(this))
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    async startCallback(msg: Telegram.Message, _: RegExpExecArray | null) {
        const chatId = msg.chat.id

        return this.client.sendMessage(chatId, startMessage)
    }

    async suscribeCallback(
        msg: Telegram.Message,
        match: RegExpExecArray | null
    ) {
        const chatId = msg.chat.id

        if (!match || !match[1]) {
            return this.client.sendMessage(
                chatId,
                "Please specify the desired ROI target."
            )
        }

        const roiTarget = parseFloat(match[1])

        const suscriber = this.suscribers.find((s) => s.chatId === chatId)
        if (!suscriber) {
            this.suscribers.push({
                chatId,
                roiTarget: roiTarget,
            })
        }

        return this.client.sendMessage(
            chatId,
            `Suscribed!\nROI target set to ${roiTarget}%`
        )
    }

    async publish(roi: number) {
        for (const [index, suscriber] of this.suscribers.entries()) {
            if (roi >= suscriber.roiTarget) {
                this.suscribers.splice(index, 1)
                await this.client.sendMessage(
                    suscriber.chatId,
                    `ROI target reached!\nCurrent ROI: ${roi.toFixed(2)}%`
                )
            }
        }
    }
}
