let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let assert = chai.assert

import { createConnection } from 'typeorm'
import { WeChatApp } from "../entity/WeChatApp"
import { WeChatAppModel } from '../WeChatAppModel'
import { WeChatUserModel } from '../WeChatUserModel'
import { WeChatUser } from '../entity/WeChatUser'
import { someCarouselWithNoTextActivity, typingActivity, quickReplyActivity, messageWithSimpleAttachmentActivity, messageWithTextOnlyActivity } from '../../activities-types/src/testActivities'


createConnection()
chai.use(chaiHttp)

describe('Store WeChatApp in DB', () => {

    it('should save weChatApp in DB', (done) => {
        let weChatApp = {
            appid: 'a',
            appsecret: 'b',
        }
        chai
            .request('http://1fd9fdb60e2e.ngrok.io')
            .post('/create')
            .send(weChatApp)
            .end((err, response) => {
                response.should.have.status(200)
                done()
            })
    })


    it('should return 401 because of wrong body', (done) => {
        let weChatApp = {
            apId: 'a',
            apsecret: 'b',
        }
        chai
            .request('http://1fd9fdb60e2e.ngrok.io')
            .post('/create')
            .send(weChatApp)
            .end((err, response) => {
                response.should.have.status(401)
                done()
            })
    })
})

describe('WeChatApp Validation', () => {
    it('should return false because of wrong query', () => {
        const query = {
            nonce: "a",
            timestamp: "a"
        }
        const isValid = WeChatAppModel.checkSignature(query)
        assert.equal(isValid, false)
    })
})

describe('Store WeChat User in DB', () => {
    it('should store user in DB', async () => {
        const weChatApp = await WeChatApp.findOne({ appId: 'a' })
        const user = "newUser"
        const createdUser: WeChatUser = await WeChatUserModel.findOrCreateWithProfile(user, weChatApp)
        assert.equal(createdUser.weChatUserId, user)
    })
})

describe.skip("Humanise Activities", () => {
    it("should send activities to  to JD's weChat", async () => {
        await WeChatAppModel.handleHumaniseActivity(typingActivity)
        await WeChatAppModel.handleHumaniseActivity(someCarouselWithNoTextActivity)
        await WeChatAppModel.handleHumaniseActivity(quickReplyActivity)
        await WeChatAppModel.handleHumaniseActivity(messageWithTextOnlyActivity)
        await WeChatAppModel.handleHumaniseActivity(messageWithSimpleAttachmentActivity)
    })
})