import { WeChatUser } from './entity/WeChatUser'
import { WeChatApp } from './entity/WeChatApp'

export class WeChatUserModel {
  public static async findOrCreateWithProfile(userId: string, weChatApp: WeChatApp) {
    let weChatUser = await this.findProfile(userId, weChatApp)

    if (!weChatUser) {
      weChatUser = await this.createProfile(userId, weChatApp)
    }

    return weChatUser
  }

  private static async findProfile(userId: string, weChatApp: WeChatApp) {

    const weChatUser = await WeChatUser.findOne({
      weChatUserId: userId,
      weChatApp: weChatApp,
    })

    return weChatUser
  }

  private static async createProfile(userId: string, weChatApp: WeChatApp) {
    let weChatUser = WeChatUser.create({
      customerProfileId: '1',
      weChatUserId: userId,
      weChatApp: weChatApp,
    })

    await WeChatUser.save(weChatUser)

    return weChatUser
  }
}
