import { WeChatIncomingActivity } from '../weChatTypes'

export class WeChatFormatterHumanise {
  public static formatIncomingActivity(incomingActivity: WeChatIncomingActivity) {
    const baseHumaniseActivity = {
      channelType: 'wechat',
      channelId: 1,
      senderProfile: {
        id: incomingActivity.sender.customerProfileId,
        type: 'customer',
      },
    }

    const humaniseActivity = this.convertTextMessage(incomingActivity, baseHumaniseActivity)

    return humaniseActivity
  }

  private static convertTextMessage(incomingActivity: WeChatIncomingActivity, baseHumaniseActivity) {
    const activity = {
      ...baseHumaniseActivity,
      type: 'message',
      text: incomingActivity.message,
    }
    return activity
  }
}
