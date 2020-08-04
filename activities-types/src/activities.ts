import { ActivityAction, ActivityActionType } from './actions'
import { ActivityAttachment, ActivityMediaAttachmentType, AttachmentContentType } from './attachments'
import { ActivityConversation } from './conversation'
import { ActivityUser } from './user'

// TODO: we will probably have to update that in the future. But t'is the ting right now
export enum ChannelType {
  amazonEcho = 'amazonEcho',
  appleBusinessChat = 'appleBusinessChat',
  custom = 'custom',
  email = 'email',
  facebookMessenger = 'facebookMessenger',
  googleHome = 'googleHome',
  virtualPhone = 'virtualPhone',
  webChat = 'webChat',
  weChat = 'weChat',
}

export enum FallbackChannelType {
  email = 'email',
  rawVirtualPhone = 'rawVirtualPhone',
}

export enum BotConversationMode {
  supervised = 'supervised',
  unsupervised = 'unsupervised',
  paused = 'paused',
}

export enum ActivityType {
  message = 'message',
  event = 'event',
  conversationUpdate = 'conversationUpdate',
  endOfConversation = 'endOfConversation',
  messageDelete = 'messageDelete',
  messageUpdate = 'messageUpdate',
  messageReaction = 'messageReaction',
  messageReactionDelete = 'messageReactionDelete',
  messageDelivered = 'messageDelivered',
  messageRead = 'messageRead',
  typing = 'typing',
}

export enum SendingToChannelErrorCode {
  SENT_OUTSIDE_OF_WINDOW = 'SENT_OUTSIDE_OF_WINDOW',
  // NOTE: and add any other type of shit we might support
  UNKNOWN = 'UNKNOWN',
}

export interface BaseActivity {
  /**
   * simply the id of this activity. Will be present on all outgoing updates and absent in incoming ones
   */
  id?: string

  organizationId?: string

  channelType?: ChannelType
  /** channelId is optional as it might not be required for activities going out from IM.
   * But all activities going from channel to IM will contain one
   */
  channelId?: string

  // createdAt and updatedAt are only present after having been stored in the db -> not on incoming activities
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date

  senderProfileId?: string
  senderProfile?: ActivityUser
  /**
   * Interaction Manager MUST include the recipient when sending an update to the channel Module
   * Channels SHOULD NOT include it when sending update to the IM. It is really only used by channel...
   */
  recipientProfile?: ActivityUser
  conversationId?: string
  conversation?: ActivityConversation

  failedSendingToChannelReason?: SendingToChannelErrorCode
  /**
   * if an activity is a reply to another activity, it should be used. Particularly useful for emails
   * this basically allows for threaded conversations as would be required in emails.
   */
  replyToId?: string
  /** an object which can contain specific data about a specific channel. Might not use initially. */
  channelData?: {
    userSession?: {
      id?: string
      refCode?: string
      source?: string
    }
    [key: string]: any
  }
  /**
   * This is *NOT* the nluContext
   */
  context?: {}
  type?: ActivityType
}

export interface BaseMessageActivity extends BaseActivity {
  type: ActivityType.message | ActivityType.messageUpdate
  text?: string
  /**
   * The text to send straight to the Nlu/bot instead of the text when it is present.
   */
  payload?: string
  /** if undefined, it is assumed to be plain. It will almost always be plain for us. Even with fulfill */
  textFormat?: 'plain' | 'markdown' | 'xml'
  /** ISO 639-1 language code for the language of the text. */
  locale?: string
  /**
   * the shit a speech based channel should say rather than what is in text.
   * Should be in SSML format (https://www.w3.org/TR/speech-synthesis/)
   */
  /** Translate everything that is translateable */
  translations?: {
    [languageLocaleCode: string]: {
      text?: string
      speak?: string
      summary?: string
      suggestedActions?: {
        actions: ActivityAction[]
      }
      attachments?: ActivityAttachment[]
    }
    // NOTE: this is strictly here to satisfy the typeGraphql type for now. Should be removed once we figure out
    // how to do this object in graphql with an array like key thingy
    // tslint:disable-next-line: ban-types
  }

  speak?: string
  // TODO: geo should be a type of attachment, as in FB Messenger.
  attachments?: ActivityAttachment[]
  attachmentLayout?: 'list' | 'carousel' // how to display the attachments. undefined defaults to list
  /** text to replace attachments if channel doesn't support them (i.e. SMS). */
  summary?: string
  /** actions we want to allow the users to perform (like cards, buttons etc) */
  suggestedActions?: {
    actions: ActivityAction[]
    inputState?: 'hidden' | 'visible' | 'disabled'
  }
  value?: object // programmatic payload specific to the update being sent
  /** dateTime in string format (milliseconds since 1970) */
  expiration?: Date
  /** if undefined, is assumed normal */
  importance?: 'low' | 'normal' | 'high'
  /** if undefined, assumed normal */
  deliveryMode?: 'normal' | 'notification'
  /**
   * list of terms or references that speech and language systems can listen for
   * kind of like the "Alexa" or "Ok Google" - not too sure what the point is...
   */
  listenFor?: string[]
  /** will be true if the activity is a comment (typically from an agent on a conversation) */
  isComment?: boolean

  /** whether the activity has been edited at any point */
  edited?: boolean

  notifiedBy?: FallbackChannelType
}

export interface MessageActivity extends BaseMessageActivity {
  type: ActivityType.message
}

export interface MessageDeleteActivity extends BaseActivity {
  type: ActivityType.messageDelete
  id: string
}

export interface MessageUpdateActivity extends BaseMessageActivity {
  type: ActivityType.messageUpdate
  id: string
}

export interface MessageReactionActivity extends BaseActivity {
  type: ActivityType.messageReaction
  messageActivityId: string
  value: string
}

export interface MessageReactionDeleteActivity extends BaseActivity {
  type: ActivityType.messageReactionDelete
  id: string
}

export interface MessageDeliveredActivity extends BaseActivity {
  type: ActivityType.messageDelivered
  id: string
}

export interface MessageReadActivity extends BaseActivity {
  type: ActivityType.messageRead
  id: string
}

export enum EventActivityName {
  botConversationModeChanged = 'botConversationModeChanged',
  escalationRequested = 'escalationRequested',
  setContext = 'setContext',
  connected = 'connected',
  disconnected = 'disconnected',
  postBack = 'postBack',
  referral = 'referral',
}

export interface EventActivity extends BaseActivity {
  type: ActivityType.event
  /** Name of the event. */
  name: EventActivityName
  /** Open-ended value. */
  value?: any
}

export type ReferralValue = {
  /** Some referral object either as a string or decoded as an object */
  ref: {
    /** Used to set a context alongside a referral. Same as doing a setContext event */
    context?: any
    refCode?: string
    [key: string]: string | number | boolean | undefined
    syncPotentialFailedActivities?: boolean
    /** From where the bot should start with this referral. If not specified. Going to START */
    botEntryPoint?: string
    minutesAfterWhichBotEntryPointExpires?: number
    /** specific to accommodation module after refCode decoding */
    reservationId?: string
  }
  source?: string
}

// NOTE: does not extend EventActivity, because otherwise types get confused and assume any
// for value even though the name is referral...
export interface ReferralEventActivity extends BaseActivity {
  type: ActivityType.event
  name: EventActivityName.referral
  value: ReferralValue
}

export interface ConversationUpdateActivity extends BaseActivity {
  type: ActivityType.conversationUpdate
  /** array of profileIds */
  membersAdded?: string[]
  membersRemoved?: string[]
  /** a potential new topic for the conversation */
  topicName?: string
}

export interface EndOfConversationActivity extends BaseActivity {
  type: ActivityType.endOfConversation
  /** can bee used to specify the reason for the conversation end. Would need to come up with codes */
  code?: string
  /** optional text to send the user at the same time as the conversation ends. */
  text?: string
}

export interface TypingActivity extends BaseActivity {
  type: ActivityType.typing
  typingTime?: number
}

export type Activity =
  | MessageActivity
  | EventActivity
  | ReferralEventActivity
  | ConversationUpdateActivity
  | EndOfConversationActivity
  | MessageDeliveredActivity
  | MessageReadActivity
  | MessageDeleteActivity
  | MessageUpdateActivity
  | MessageReactionActivity
  | MessageReactionDeleteActivity
  | TypingActivity


