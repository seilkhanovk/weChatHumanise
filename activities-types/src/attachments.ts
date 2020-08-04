import { ActivityActionType } from './actions'

export enum AttachmentContentType {
  // NOTE: type is here microsoft because we are using a microsoft library in the frontend to parse them
  adaptiveCard = 'application/vnd.microsoft.card.adaptive',
  contactCard = 'application/vnd.humanise-ai.card.contact',
  buttonCard = 'application/vnd.humanise-ai.card.button',
  heroCard = 'application/vnd.humanise-ai.card.hero',
}

/** @private Abstract attachment object. */
export interface BaseActivityAttachment {
  /** The attachment's MIME type. */
  contentType: string
}

/** Adaptive Card attachment object. */
export interface ActivityAdaptiveCardAttachment extends BaseActivityAttachment {
  contentType: AttachmentContentType.adaptiveCard
  /** Adaptive Card content */
  content: object
}

export type CardAction = {
  readonly type: ActivityActionType
  readonly title: string
  readonly text?: string
  readonly value?: string
}

export enum ContactCardField {
  fullName = 'fullName',
  email = 'email',
  phoneNumber = 'phoneNumber',
}

export interface ActivityContactCardAttachment extends BaseActivityAttachment {
  readonly contentType: AttachmentContentType.contactCard
  readonly content: {
    readonly fields: ReadonlyArray<ContactCardField>
    readonly required?: ReadonlyArray<ContactCardField>
  }
}

export interface ActivityButtonCardAttachment extends BaseActivityAttachment {
  readonly contentType: AttachmentContentType.buttonCard
  readonly content: {
    readonly text: string
    readonly buttons: readonly CardAction[]
  }
}

export interface ActivityHeroCardAttachment extends BaseActivityAttachment {
  readonly contentType: AttachmentContentType.heroCard
  readonly content: {
    readonly imageUrl?: string
    readonly title: string
    readonly subtitle?: string
    /** @deprecated */ // is it ok to be deprecated? 
    readonly text?: string
    readonly buttons?: ReadonlyArray<CardAction>
  }
}

/** Media attachment MIME types. */
export enum ActivityMediaAttachmentType {
  imagePng = 'image/png',
  imageJpg = 'image/jpg',
  imageJpeg = 'image/jpeg',
  imageGif = 'image/gif',
}

/** Media attachment object. */
export interface ActivityMediaAttachment extends BaseActivityAttachment {
  contentType: ActivityMediaAttachmentType
  /** URL to the attachment media. */
  contentUrl: string
  /**
   * URL to a thumbnail image that can be used as an alternative, smaller
   * version of `contentUrl`
   */
  thumbnailUrl?: string
  /** The attachment's name. */
  name?: string
}

export type ActivityAttachment =
  | ActivityAdaptiveCardAttachment
  | ActivityContactCardAttachment
  | ActivityButtonCardAttachment
  | ActivityHeroCardAttachment
  | ActivityMediaAttachment
