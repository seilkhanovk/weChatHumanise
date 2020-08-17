import { redis } from "./redisInstance"

export class RedisModel {
    public static async deleteAttachmentButtons(senderId: string) {
        await redis.del(`buttonModeOnFor:${senderId}`)
        const numberOfAttachments = await redis.get(`numberOfAttachmentsFor:${senderId}`)
        const numberOfButtons = await redis.get(`numberOfButtonsFor:${senderId}`)

        await redis.del(`numberOfAttachmentsFor:${senderId}`)
        await redis.del(`numberOfButtonsFor:${senderId}`)
        for (let attachmentInd = 1; attachmentInd <= numberOfAttachments; attachmentInd++) {
            for (let buttonInd = 1; buttonInd <= numberOfButtons; buttonInd++) {
                const buttonNumber = attachmentInd + "." + buttonInd
                await redis.del(`buttonNum:${buttonNumber}of:${senderId}`)
            }
        }
    }

    public static async deleteQuickReplyButtons(senderId: string) {
        await redis.del(`quickReplyModeOnFor:${senderId}`)
        const numberOfButtons = await redis.get(`numberOfButtonsFor:${senderId}`)
        await redis.del(`numberOfButtonsFor:${senderId}`)
        for (let buttonInd = 1; buttonInd <= numberOfButtons; buttonInd++) {
            const buttonNumber = buttonInd
            await redis.del(`buttonNum:${buttonNumber}of:${senderId}`)
        }
    }
}