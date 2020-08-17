const request = require('request-promise-native')
const fs = require('fs')
const { promisify } = require('util')

import type { WeChatMessage2send } from './weChatTypes'
import { WeChatFormatterOutgoing } from './WeChatFormatters/WeChatFormatterOutgoing'
import { WeChatApp } from './entity/WeChatApp'

import { redis } from './redisInstance'

const imageName = 'obj11.jpg'
export class WeChatGateway {
  public static sendActivityOLD(ctx, message: string, fromUsername: string, toUsername: string) {
    const activity: WeChatMessage2send = {
      content: message,
      msgType: 'text',
      createTime: new Date().getTime(),
      toUsername: toUsername,
      fromUsername: fromUsername,
    }
    const xml2send = WeChatFormatterOutgoing.convert2XML(activity)
    ctx.body = xml2send
  }

  public static async sendMessageActivity(userId: string, weChatApp: WeChatApp, message: string, attemptCount: number = 0) {
    const accessToken = await this.getAccessToken(weChatApp, attemptCount > 0)

    try {
      await request({
        method: 'POST',
        uri: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
        qs: {
          access_token: accessToken,
        },
        body: {
          touser: userId,
          msgtype: 'text',
          text: {
            content: message
          },
        },
        json: true,
      })
    } catch (err) {
      if (err.status === 403 || err.status === 401) {
        attemptCount += 1
        if (attemptCount >= 2) throw Error(`Could not make request for: ${weChatApp.appId}`)
        return WeChatGateway.sendMessageActivity(userId, weChatApp, message, attemptCount)
      }
    }
  }

  public static async getAccessToken(weChatApp: WeChatApp, forceNew: boolean = false) {
    let accessToken: string

    if (!forceNew) {
      accessToken = await redis.get(`wechatAccessToken:${weChatApp.appId}`)

      if (accessToken) return accessToken
    }

    const response = await request({
      method: 'GET',
      json: true,
      uri: 'https://api.weixin.qq.com/cgi-bin/token',
      qs: {
        grant_type: 'client_credential',
        appid: weChatApp.appId,
        secret: weChatApp.appSecret,
      },
    })

    const expiresIn = response.expires_in
    accessToken = response.access_token
    await redis.set(`wechatAccessToken:${weChatApp.appId}`, accessToken, 'EX', expiresIn - 10)

    return accessToken
  }

  public static async sendImageActivity(userId: string, weChatApp: WeChatApp, url: string) {
    const accessToken = await this.getAccessToken(weChatApp)

    const mediaId = await this.getMediaId(weChatApp, url)

    try {
      await request({
        method: 'POST',
        uri: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
        qs: {
          access_token: accessToken,
        },
        body: {
          touser: userId,
          msgtype: 'image',
          image: {
            media_id: mediaId,
          },
        },
        json: true,
      })
    } catch (err) {
      throw Error('Could not send image' + err)
    }
  }

  public static async getMediaId(weChatApp: WeChatApp, url: string) {
    const accessToken = await this.getAccessToken(weChatApp)

    let mediaId = await redis.get(`mediaId:${url}`)

    if (mediaId) {
      return mediaId
    }
    await this.downloadImageFromUrl(url);

    const formData = {
      key: 'image',
      value: fs.createReadStream(imageName),
    }

    const response = await request({
      method: 'POST',
      uri: 'https://api.weixin.qq.com/cgi-bin/media/upload',
      qs: {
        access_token: accessToken,
        type: 'image',
      },
      formData: formData,
    })
    console.log(response)
    const expiresIn = 72 * 60 * 60
    mediaId = JSON.parse(response).media_id
    await redis.set(`mediaId:${url}`, mediaId, 'EX', expiresIn - 10)

    return mediaId
  }

  public static async sendTypingStatus(userId: string, weChatApp: WeChatApp) {
    const accessToken = await this.getAccessToken(weChatApp)

    const response = await request({
      method: 'POST',
      uri: 'https://api.weixin.qq.com/cgi-bin/message/custom/typing',
      qs: {
        access_token: accessToken,
      },
      body: {
        touser: userId,
        command: 'Typing',
      },
      json: true,
    })
  }

  public static async downloadImageFromUrl(url: string) {
    const response = await request({
      method: 'GET',
      uri: url,
      encoding: 'binary',
    })

    return new Promise((resolve, reject) => {

      let writeStream = fs.createWriteStream(imageName);
      writeStream.write(response, 'binary');
      writeStream.end();
      writeStream.on('finish', () => {
        console.log('wrote all data to file');
        return resolve()
      });
    })

  }
}
