'use strict'

require('dotenv').config()
const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const koaBody = require('koa-body')

import { createConnection } from 'typeorm'
import type { Context } from 'koa'
import { WeChatAppModel } from './WeChatAppModel'
import { WeChatRouter } from './WeChatRouter'
import { isUndefined } from 'util'
import { WeChatAppController } from './WeChatAppController'
import { Cryptography } from './Cryptography'

createConnection()

app.use(koaBody())

const router = new Router()

router
  .get('/wechat/:appId', (ctx: Context) => {
    WeChatAppModel.appValidation(ctx)
  })
  .post('/wechat/:appId', (ctx: Context) => {
    ctx.body = '' // need to send empty body, otherwise it will forward "bot unavailable" to the user
    const appId = ctx.params.appId
    WeChatRouter.receiveActivity(ctx, appId)
  })
  .post('/create', async (ctx: Context) => {
    const body = ctx.request.body
    const appId = body['appid']
    const appSecret = body['appsecret']
    if (appSecret && appId) {
      ctx.body = 'Succeeded!'
      await WeChatAppController.createWithProfile(appId, appSecret)
    } else {
      ctx.status = 401
      ctx.body = 'Failed! Bad body'
    }
  })
  .post('/encrypt', (ctx: Context) => {
    const body = ctx.request.body
    if (body['data']) {
      const encryptedData = Cryptography.encrypt(body['data'])
      console.log(encryptedData)
      ctx.body = "Encrypted"
    } else {
      ctx.status = 401
      ctx.body = "Data field is missing"
    }
  })
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(5000, () => {
  console.log('Server running')
})
