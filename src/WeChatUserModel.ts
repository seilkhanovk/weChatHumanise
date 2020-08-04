import { WeChatUser } from './entity/WeChatUser'
import { WeChatApp } from './entity/WeChatApp'

export class WeChatUserModel {
  public static async findOrCreateWithProfile(senderId: string, weChatApp: WeChatApp) {
    let weChatUser = await this.findProfile(senderId, weChatApp)

    if (!weChatUser) {
      weChatUser = await this.createProfile(senderId, weChatApp)
    }

    return weChatUser
  }

  private static async findProfile(senderId: string, weChatApp: WeChatApp) {
    // not sure if im doing this right ... but it works

    const weChatUser = await WeChatUser.findOne({
      weChatUserId: senderId,
      weChatApp: weChatApp,
    })

    return weChatUser
  }

  private static async createProfile(sendId: string, weChatApp: WeChatApp) {
    let weChatUser = WeChatUser.create({
      customerProfileId: '1',
      weChatUserId: sendId,
      weChatApp: weChatApp,
    })

    await WeChatUser.save(weChatUser)

    return weChatUser
  }
}
