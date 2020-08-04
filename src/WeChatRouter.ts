import { WeChatAppModel } from './WeChatAppModel'
import { WeChatFormatterIncoming } from './WeChatFormatters/WeChatFormatterIncoming'
import { WeChatApp } from './entity/WeChatApp'
import type { Context } from 'koa'
import { someCarousel, typingActivity, quickReplyActivity } from '../activities-types/src/testActivities'

export class WeChatRouter {
  public static async receiveActivity(ctx: Context, appId: string) {
    const query = ctx.query
    const isValid = WeChatAppModel.checkSignature(query)

    const weChatApp = await WeChatApp.findOne({ appId: appId })

    if (!isValid) {
      console.log('Invalid signature')
      ctx.status = 401
      ctx.body = 'Invalid signature'
      return
    }
    // for now it supports only messages
    var xmlFromWeChat = ctx.request.body
    const formatted = WeChatFormatterIncoming.parseXML(xmlFromWeChat)
    console.log(formatted)
    // WeChatAppModel.handleHumaniseActivity(quickReplyActivity)
    // await WeChatAppModel.handleHumaniseActivity(typingActivity)
    // await WeChatAppModel.handleHumaniseActivity(someCarousel)
    WeChatAppModel.handleIncomingActivity(weChatApp, formatted['FromUserName'], formatted['Content'])
  }
}
