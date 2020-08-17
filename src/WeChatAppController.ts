import { WeChatApp } from './entity/WeChatApp'
import { isUndefined } from 'util'

export class WeChatAppController {

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
        } else
            return true
    }
}
