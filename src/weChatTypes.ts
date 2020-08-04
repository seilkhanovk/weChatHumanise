import { WeChatApp } from './entity/WeChatApp'
import { WeChatUser } from './entity/WeChatUser'

export type WeChatIncomingActivity = {
  sender: WeChatUser
  message: string
  weChatApp: WeChatApp
}

export type WeChatMessage2send = {
  content: string
  msgType: string
  createTime: number
  toUsername: string
  fromUsername: string
}
