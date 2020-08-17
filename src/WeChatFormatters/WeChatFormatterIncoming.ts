
import { ActivityHeroCardAttachment, AttachmentContentType, ActivityAttachment, CardAction, ActivityButtonCardAttachment, ActivityMediaAttachment } from '../../activities-types/src/attachments'
import { WeChatGateway } from "../WeChatGateway"
import { WeChatApp } from "../entity/WeChatApp"
import { redis } from "../redisInstance"
import { ActivityAction, ActivityOpenUrlAction, ActivityActionType } from '../../activities-types/src'
const xml2js = require('xml2js')

export class WeChatFormatterIncoming {
  public static parseXML(xml) {
    var result

    xml2js.parseString(xml, function (err, res) {
      result = res
    })
    const formatted = this.formatWeChatXML(result.xml)
    return formatted
  }

  private static formatWeChatXML(result) {
    var message = {}
    if (typeof result === 'object') {
      for (var key in result) {
        if (!(result[key] instanceof Array) || result[key].length === 0) {
          continue
        }
        if (result[key].length === 1) {
          var val = result[key][0]
          if (typeof val === 'object') {
            message[key] = this.formatWeChatXML(val)
          } else {
            message[key] = (val || '').trim()
          }
        } else {
          message[key] = result[key].map(function (item) {
            return this.formatWeChatXML(item)
          })
        }
      }
    }
    return message
  }

  public static async formatHeroCardAttachment(receiverId: string, weChatApp: WeChatApp, attachments: ActivityAttachment[]) {
    let notifyUser = true
    let maxButtons = 0
    for (let attachmentInd in attachments) {
      let attachment = attachments[attachmentInd] as ActivityHeroCardAttachment
      if (attachment.contentType == AttachmentContentType.heroCard) {
        const content = attachment.content

        const imgUrl = content.imageUrl
        let imgDescription = content.title + '\n' + content.subtitle

        await WeChatGateway.sendImageActivity(receiverId, weChatApp, imgUrl)
        await WeChatGateway.sendMessageActivity(receiverId, weChatApp, imgDescription)

        const buttons = content.buttons

        if (buttons) {
          if (notifyUser) {
            const message = "Please, choose button by typing back its number"
            await WeChatGateway.sendMessageActivity(receiverId, weChatApp, message)
            await redis.set(`buttonModeOnFor:${receiverId}`, true)
            notifyUser = false
          }
          maxButtons = Math.max(maxButtons, buttons.length)
          const buttonsToFunction = JSON.parse(JSON.stringify(buttons)) // hacky way to pass readonly variable to the function
          await this.formatButtons(receiverId, weChatApp, buttonsToFunction, attachmentInd)
        }
      }
    }
    await redis.set(`numberOfAttachmentsFor:${receiverId}`, attachments.length)
    await redis.set(`numberOfButtonsFor:${receiverId}`, maxButtons)
  }

  public static async formatButtonCardAttachment(receiverId: string, weChatApp: WeChatApp, attachments: ActivityAttachment[]) {

    let message = "Please, choose button by typing back its number"
    await WeChatGateway.sendMessageActivity(receiverId, weChatApp, message)
    await redis.set(`buttonModeOnFor:${receiverId}`, true)

    let maxButtons = 0
    for (let attachmentInd in attachments) {
      const attachement = attachments[attachmentInd] as ActivityButtonCardAttachment
      message = attachement.content.text

      await WeChatGateway.sendMessageActivity(receiverId, weChatApp, message)

      const buttons = attachement.content.buttons
      maxButtons = Math.max(maxButtons, buttons.length)
      const buttonsToFunction = JSON.parse(JSON.stringify(buttons)) // hacky way to pass readonly variable to the function
      await this.formatButtons(receiverId, weChatApp, buttonsToFunction, attachmentInd)
    }
    await redis.set(`numberOfAttachmentsFor:${receiverId}`, attachments.length)
    await redis.set(`numberOfButtonsFor:${receiverId}`, maxButtons)
  }

  private static async formatButtons(receiverId: string, weChatApp: WeChatApp, buttons: CardAction[], attachmentInd: string) {
    for (let buttonInd in buttons) {
      const i: number = Number(attachmentInd) + 1
      const j: number = Number(buttonInd) + 1
      let buttonNumber: string = i + "." + j

      const button = buttons[buttonInd]
      const message = buttonNumber + "\n" + button.title
      await WeChatGateway.sendMessageActivity(receiverId, weChatApp, message)

      const value = button['value'] || button['text']
      await redis.hmset(`buttonNum:${buttonNumber}of:${receiverId}`, { type: button.type, value: value })

    }
  }

  public static async formatMediaAttachment(receiverId: string, weChatApp: WeChatApp, attachments: ActivityAttachment[]) {
    for (let attachmentInd in attachments) {
      const attachment = attachments[attachmentInd] as ActivityMediaAttachment
      const message = attachment.name
      await WeChatGateway.sendMessageActivity(receiverId, weChatApp, message)

      const imgUrl = attachment.contentUrl
      await WeChatGateway.sendImageActivity(receiverId, weChatApp, imgUrl)
    }
  }

  public static async formatSuggestedActions(receiverId: string, weChatApp: WeChatApp, actions: ActivityAction[]) {
    let message = "Please, choose button by typing back its number"
    await redis.set(`quickReplyModeOnFor:${receiverId}`, true)
    await WeChatGateway.sendMessageActivity(receiverId, weChatApp, message)
    for (let actionInd in actions) {
      let action = actions[actionInd]
      const buttonNumber: number = Number(actionInd) + 1
      message = buttonNumber + ".\n" + action.title
      await WeChatGateway.sendMessageActivity(receiverId, weChatApp, message)

      let value = action['value'] || action['text']
      await redis.hmset(`buttonNum:${buttonNumber}of:${receiverId}`, { type: action.type, value: value })

    }
    await redis.set(`numberOfButtonsFor:${receiverId}`, actions.length)
  }
}
