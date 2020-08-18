
# WeChatHumanise.ai project

This project was done as an internship project for www.humanise.ai

# What it does?

This project is an extension for humanise.ai chatbot. Basically, it sends activities coming from humanise.ai to WeChat bot.

# How I can benefit from this project?

If you are interested in building WeChat bots, then you should probably spend a while learning Chinese language as most of its documentation in Chinese. So, with the help of this project you can omit language learning part. No, it will not teach you Chinese so that you could talk about coronovirus with random Chinee. Just go to **WeChatGateway.ts** and gain valuable insights of WeChat Api. Probably in a month I will make a separate WeChat Api extension for Koa.js and Express.js. So, stay tuned and follow my github account :)

## What Activities does it support?

Currently, this project does not support buch of the stuff because of some WeChat limitations. So, things it supports: <br/>
**Activities**: MessageActivity and TypingActivity <br/>
**Attachments**: ButtonCardAttachment, HeroCardAttachment and MediaAttachment. <br/>
**QuickReply Buttons**: MessageBackAction, OpenURLAction, DownloadFileAction, ShowImageFileAction, ActivitySignInAction, ActivityCallAction. Note: quick reply just sends back the content (message or url) of these actions, except for ShowImageFileActions; it sends downloaded image to the user.