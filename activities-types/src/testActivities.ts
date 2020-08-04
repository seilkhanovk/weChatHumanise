import { ActivityAction, ActivityActionType } from './actions'
import { ActivityAttachment, ActivityMediaAttachmentType, AttachmentContentType } from './attachments'
import { ActivityConversation } from './conversation'
import { ActivityUser } from './user'
import * as A from "./activities"



export enum ProfileType {
    customer = 'customer',
    agent = 'agent',
    bot = 'bot',
}

export const typingActivity: A.TypingActivity = {
    id: "1",
    organizationId: "1",
    recipientProfile: {
        type: ProfileType.customer,
        id: "oaEn4s46XaKV-xnaZcRyAksqSByo",
        organizationId: "wx741c63985577bd6b"
    },
    type: A.ActivityType.typing,
    typingTime: 2
}

export const quickReplyActivity: A.MessageActivity = {
    id: "1",
    organizationId: "1",
    recipientProfile: {
        type: ProfileType.customer,
        id: "oaEn4s46XaKV-xnaZcRyAksqSByo",
        organizationId: "wx741c63985577bd6b"
    },
    type: A.ActivityType.message,
    suggestedActions: {
        actions: [
            {
                type: ActivityActionType.messageBack,
                title: "Asiya1",
                text: "Message1",
            },
            {
                type: ActivityActionType.messageBack,
                title: "Asiya2",
                text: "Message2",
            },
            {
                type: ActivityActionType.messageBack,
                title: "Asiya3",
                text: "Message3",
            },
        ]
    }
}

const someActivity: A.MessageActivity = {
    type: A.ActivityType.message,
    channelId: '1',
    id: '1',
    organizationId: '1',
    recipientProfile: {
        type: ProfileType.customer,
        id: '1',
        organizationId: '1',
    },
    senderProfileId: '2',
    text: 'Some text',
    attachments: [
        {
            contentType: ActivityMediaAttachmentType.imagePng,
            contentUrl: 'https://some-url.com',
        },
    ],
}


export const someCarousel: A.MessageActivity = {
    type: A.ActivityType.message,
    channelId: '1',
    id: '1',
    organizationId: '1',
    recipientProfile: {
        type: ProfileType.customer,
        id: 'oaEn4s46XaKV-xnaZcRyAksqSByo',
        organizationId: 'wx741c63985577bd6b',
    },
    senderProfileId: '2',
    text: "",
    attachmentLayout: 'carousel',
    attachments: [
        {
            contentType: AttachmentContentType.heroCard,
            content: {
                imageUrl: 'https://d.newsweek.com/en/full/1506960/rick-morty-season-4-release-date.png?w=1600&h=1200&q=88&f=d9f346aa64802a3def7f4b22b646cd51',
                title: 'Card Title',
                subtitle: 'Some subtitle',
                buttons: [
                    {
                        type: ActivityActionType.messageBack,
                        title: 'Shop Now',
                        text: 'Shop Now First t-shirt',
                    },
                    {
                        type: ActivityActionType.openUrl,
                        title: 'View Details',
                        value: 'https://go-to-this-page.com/t-shirt1',
                    },
                ],
            },
        },
        {
            contentType: AttachmentContentType.heroCard,
            content: {
                imageUrl: 'https://cdn.vox-cdn.com/thumbor/G8A4RF-QWQl7jItQw93r402os_0=/1400x1050/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/10816041/rick_and_morty_s02_still.jpg',
                title: 'Second Card Title',
                subtitle: 'Second Card title',
                buttons: [
                    {
                        type: ActivityActionType.messageBack,
                        title: 'Shop Now',
                        text: 'Shop Now - second t-shirt',
                    },
                    {
                        type: ActivityActionType.openUrl,
                        title: 'View Details',
                        value: 'https://go-to-this-page.com/t-shirt2',
                    },
                ],
            },
        },
    ],
}