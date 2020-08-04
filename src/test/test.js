let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let assert = chai.assert

chai.use(chaiHttp)

describe('Store Wechatapp in DB', () => {
  // describe("/get", () => {
  //     it("it should validate wechatapp", (done) => {
  //         chai.request("http://b5f67bee43ec.ngrok.io")
  //             .get("/wechat/wx741c63985577bd6b")
  //             .end((err, response) => {
  //                 response.should.have.status(200);
  //                 // response.body.should.be.a("array");
  //                 done();
  //             })
  //     })
  // })

  describe('/post', () => {
    it('it should store wechatapp in DB', (done) => {
      let weChatApp = {
        appid: 'a',
        appsecret: 'b',
      }
      chai
        .request('http://b5f67bee43ec.ngrok.io')
        .post('/create')
        .send(weChatApp)
        .end((err, response) => {
          response.should.have.status(200)
          response.text.should.equal('Succeeded!')
          done()
        })
    })
  })

  describe('/post', () => {
    it('it should throw 401 because of wrong body', (done) => {
      let weChatApp = {
        appId: 'a',
        appsecret: 'b',
      }
      chai
        .request('http://b5f67bee43ec.ngrok.io')
        .post('/create')
        .send(weChatApp)
        .end((err, response) => {
          response.should.have.status(401)
          done()
        })
    })
  })
})
