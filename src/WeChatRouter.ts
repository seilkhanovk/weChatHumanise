import { WeChatAppModel } from './WeChatAppModel'
import { WeChatFormatterIncoming } from './WeChatFormatters/WeChatFormatterIncoming'
import { WeChatApp } from './entity/WeChatApp'
import type { Context } from 'koa'

export class WeChatRouter {
  public static async receiveActivity(ctx: Context, appId: string) {
    const query = ctx.query
    const isValid = WeChatAppModel.checkSignature(query)

    const weChatApp = await WeChatApp.findOne({ appId: appId })

    if (!weChatApp) {
      throw Error('WeChatApp not stored in DB')
    }

    if (!isValid) {
      throw Error('Invalid signature')
    }
    // for now it supports only messages
    var xmlFromWeChat = ctx.request.body
    const formatted = WeChatFormatterIncoming.parseXML(xmlFromWeChat)

    if (formatted['FromUserName'] && formatted['Content']) {
      WeChatAppModel.handleIncomingActivity(weChatApp, formatted['FromUserName'], formatted['Content'])
    } else {
      throw Error("WeChat changed its XML format")
    }

  }
}
