import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm'

import { WeChatApp } from './WeChatApp'
@Entity({ name: 'wechatusers' })
export class WeChatUser extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  weChatUserId: string

  @Column({ type: 'bigint' })
  customerProfileId: string

  @Column({ type: 'bigint' })
  weChatAppId: string

  @ManyToOne((type) => WeChatApp, (weChatApp) => weChatApp.weChatUsers)
  weChatApp: WeChatApp
}
