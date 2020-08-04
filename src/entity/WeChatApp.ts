import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm'
import { WeChatUser } from './WeChatUser'

@Entity({ name: 'wechatapps' })
export class WeChatApp extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  appId: string

  @Column({ type: 'text' })
  appSecret: string

  @OneToMany((type) => WeChatUser, (weChatUser) => weChatUser.weChatApp)
  weChatUsers: WeChatUser[]
}
