const crypto = require('crypto')
require('dotenv').config()

import { WeChatUserModel } from './WeChatUserModel'
import { WeChatFormatterHumanise } from './WeChatFormatters/WeChatFormatterHumanise'
import { WeChatIncomingActivity } from './weChatTypes'
import { WeChatApp } from './entity/WeChatApp'
import { isUndefined } from 'util'
import { WeChatGateway } from './WeChatGateway'
import { Activity, ActivityType, AttachmentContentType, ActivityMediaAttachmentType } from '../activities-types/src'
import { WeChatFormatterIncoming } from './WeChatFormatters/WeChatFormatterIncoming'
import { redis } from './redisInstance'
import { RedisModel } from "./RedisModel"

const { TOKEN } = process.env

export class WeChatAppModel {
  public static async handleIncomingActivities(weChatApp: WeChatApp, senderId: string, message: string) {
    const weChatUser = await WeChatUserModel.findOrCreateWithProfile(senderId, weChatApp)

    const incomingActivity: WeChatIncomingActivity = {
      sender: weChatUser,
      message: message,
      weChatApp: weChatApp,
    }

    const humaniseFormattedActivity = await WeChatFormatterHumanise.formatIncomingActivity(incomingActivity)
    // await WeChatGateway.downloadImageFromUrl(weChatApp, "https://mr-mem.ru/images/memes/mem-s-kotom-za-stolom.jpg")
    // await WeChatGateway.sendTypingStatus(senderId, weChatApp)
    let url = "https://kinda.media/upload/news/1561388125.png"
    await WeChatGateway.sendImageActivity(senderId, weChatApp, url)
  }

  public static async handleIncomingActivity(weChatApp: WeChatApp, senderId: string, message: string) {
    const buttonMode = await redis.get(`buttonModeOnFor:${senderId}`)
    const quickReplyMode = await redis.get(`quickReplyModeOnFor:${senderId}`)
    if (buttonMode) {
      const button = await redis.get(`buttonNum:${message}of:${senderId}`)
      if (button) {
        console.log(button)
        await WeChatGateway.sendMessageActivity(senderId, weChatApp, "Good job")
        await RedisModel.deleteAttachmentButtons(senderId)
      }
    }
    if (quickReplyMode) {
      const button = await redis.get(`buttonNum:${message}of:${senderId}`)
      if (button) {
        console.log(button)
        await WeChatGateway.sendMessageActivity(senderId, weChatApp, "Good job")
        await RedisModel.deleteQuickReplyButtons(senderId)
      }
    }
  }
  public static async handleHumaniseActivity(incomingActivity: Activity) {
    const receiverId = incomingActivity.recipientProfile.id
    const appId = incomingActivity.recipientProfile.organizationId
    const weChatApp = await WeChatApp.findOne({ appId: appId })
    const weChatUser = await WeChatUserModel.findOrCreateWithProfile(receiverId, weChatApp)

    if (incomingActivity.type == ActivityType.message) {

      const headerText = incomingActivity.text
      await WeChatGateway.sendMessageActivity(receiverId, weChatApp, headerText)

      const attachments = incomingActivity.attachments
      if (attachments) {
        if (attachments[0].contentType == AttachmentContentType.heroCard) {
          await WeChatFormatterIncoming.formatHeroCardAttachment(receiverId, weChatApp, attachments)
        }
        if (attachments[0].contentType == AttachmentContentType.buttonCard) {
          await WeChatFormatterIncoming.formatButtonCardAttachment(receiverId, weChatApp, attachments)
        }
        if (
          attachments[0].contentType == ActivityMediaAttachmentType.imageGif ||
          attachments[0].contentType == ActivityMediaAttachmentType.imageJpeg ||
          attachments[0].contentType == ActivityMediaAttachmentType.imageJpg ||
          attachments[0].contentType == ActivityMediaAttachmentType.imagePng
        ) {
          await WeChatFormatterIncoming.formatMediaAttachment(receiverId, weChatApp, attachments)
        }
      }

      const suggestedActions = incomingActivity.suggestedActions
      if (suggestedActions) {
        await WeChatFormatterIncoming.formatSuggestedActions(receiverId, weChatApp, suggestedActions.actions)
      }
    }
    if (incomingActivity.type == ActivityType.typing) {
      await WeChatGateway.sendTypingStatus(receiverId, weChatApp);
    }

  }
  public static async appValidation(ctx) {
    const query = ctx.query
    const isValid = this.checkSignature(query)
    if (isValid) {
      ctx.body = query.echostr
      console.log('Successful verification')
    } else {
      console.log('Could not verify weChat App')
      ctx.status = 401
      ctx.body = 'Invalid signature'
    }
  }

  public static checkSignature(query) {
    const generatedSignature = this.getHashcode(query.timestamp, query.nonce, TOKEN)
    return generatedSignature == query.signature
  }

  private static getHashcode(timestamp: string, nonce: string, token: string) {
    const shasum = crypto.createHash('sha1')
    const arr = [token, timestamp, nonce].sort()
    shasum.update(arr.join(''))

    return shasum.digest('hex')
  }

  public static async createWithProfile(appId: string, appSecret: string) {
    const appInDB = await this.isAppInDB(appId, appSecret)
    if (appInDB) {
      console.log('WeChat app already in DB')
      return
    }

    let weChatApp = WeChatApp.create({
      appId: appId,
      appSecret: appSecret,
    })

    await WeChatApp.save(weChatApp)

    console.log('App saved in DB')
  }

  private static async isAppInDB(appId: string, appSecret: string) {
    const weChatApp = await WeChatApp.findOne({
      appId: appId,
      appSecret: appSecret,
    })
    if (isUndefined(weChatApp)) {
      return false
    } else return true
  }
}
