const crypto = require('crypto')
require('dotenv').config()

import { WeChatUserModel } from './WeChatUserModel'
import { WeChatFormatterHumanise } from './WeChatFormatters/WeChatFormatterHumanise'
import { WeChatIncomingActivity, WeChatButton } from './weChatTypes'
import { WeChatApp } from './entity/WeChatApp'
import { WeChatGateway } from './WeChatGateway'
import { Activity, ActivityType, AttachmentContentType, ActivityMediaAttachmentType, ActivityAction, ActivityActionType } from '../activities-types/src'
import { WeChatFormatterIncoming } from './WeChatFormatters/WeChatFormatterIncoming'
import { redis } from './redisInstance'
import { RedisModel } from "./RedisModel"
import { Cryptography } from './Cryptography'

const { TOKEN_ENCRYPTED } = process.env

export class WeChatAppModel {

  public static async handleIncomingActivity(weChatApp: WeChatApp, senderId: string, incomingMessage: string) {

    const weChatUser = await WeChatUserModel.findOrCreateWithProfile(senderId, weChatApp)

    const buttonMode = await redis.get(`buttonModeOnFor:${senderId}`)
    const quickReplyMode = await redis.get(`quickReplyModeOnFor:${senderId}`)

    if (buttonMode || quickReplyMode) {
      const button = await redis.hgetall(`buttonNum:${incomingMessage}of:${senderId}`)

      if (button.value) {
        await this.handleButtonValues(senderId, weChatApp, button)
      }

      await RedisModel.deleteAttachmentButtons(senderId)
      await RedisModel.deleteQuickReplyButtons(senderId)
    } else {

      const incomingActivity: WeChatIncomingActivity = {
        sender: weChatUser,
        message: incomingMessage,
        weChatApp: weChatApp,
      }
      const humaniseFormattedActivity = WeChatFormatterHumanise.formatIncomingActivity(incomingActivity)
      await WeChatGateway.sendMessageActivity(senderId, weChatApp, "Hi")
      console.log(humaniseFormattedActivity)
    }

  }

  private static async handleButtonValues(receiverId: string, weChatApp: WeChatApp, button: WeChatButton) {
    if (button.type == ActivityActionType.showImage) {
      await WeChatGateway.sendImageActivity(receiverId, weChatApp, button.value)
    } else {
      await WeChatGateway.sendMessageActivity(receiverId, weChatApp, button.value)
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
    const isValid = await this.checkSignature(query)
    if (isValid) {
      ctx.body = query.echostr
      console.log('Successful verification')
    } else {
      throw Error('Could not verify weChat App')
    }
  }

  public static checkSignature(query) {
    const weChatAppToken = this.getWeChatAppToken()
    const generatedSignature = this.getHashcode(query.timestamp, query.nonce, weChatAppToken)
    return generatedSignature == query.signature
  }

  private static getWeChatAppToken() {
    const token = Cryptography.decrypt(TOKEN_ENCRYPTED)
    return token
  }

  private static getHashcode(timestamp: string, nonce: string, token: string) {
    const shasum = crypto.createHash('sha1')
    const arr = [token, timestamp, nonce].sort()
    shasum.update(arr.join(''))

    return shasum.digest('hex')
  }

}