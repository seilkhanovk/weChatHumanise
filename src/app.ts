'use strict'

import { createConnection } from 'typeorm'
import type { Context } from 'koa'
const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const koaBody = require('koa-body')
import { WeChatAppModel } from './WeChatAppModel'
import { WeChatRouter } from './WeChatRouter'
import { isUndefined } from 'util'
require('dotenv').config()

createConnection()

app.use(koaBody())

const router = new Router()

router
  .get('/wechat/:appId', (ctx: Context) => {
    WeChatAppModel.appValidation(ctx)
  })
  .post('/wechat/:appId', (ctx: Context) => {
    ctx.body = ''
    const appId = ctx.params.appId
    WeChatRouter.receiveActivity(ctx, appId)
  })
  .post('/create', async (ctx: Context) => {
    const body = ctx.request.body
    const appId = body['appid']
    const appSecret = body['appsecret']

    if (isUndefined(appSecret) || isUndefined(appId)) {
      ctx.status = 401
      ctx.body = 'Failed! Bad body'
    } else {
      await WeChatAppModel.createWithProfile(appId, appSecret)
      ctx.body = 'Succeeded!'
    }
  })

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(5000, () => {
  console.log('Server running')
})
