export enum ActivityActionType {
  messageBack = 'messageBack',
  postBack = 'postBack',
  openUrl = 'openUrl',
  downloadFile = 'downloadFile',
  showImage = 'showImage',
  signIn = 'signIn',
  playAudio = 'playAudio',
  playVideo = 'playVideo',
  call = 'call',
  sharePhoneNumber = 'sharePhoneNumber',
  shareEmail = 'shareEmail',
}

/** @private Base action object. */
export interface BaseActivityAction {
  /** what to display on the button's face */
  title: string
  /** Type of action. */
  type: ActivityActionType
  /**
   * an URL to an image that can be added to the button - mostly not used really...
   */
  image?: string
}

/** Sends a message back. The basic quick reply */
export interface ActivityMessageBackAction extends BaseActivityAction {
  type: ActivityActionType.messageBack
  /**
   * The `text` field contains text content to be sent to the server and
   * included in the chat feed (on the client side if displayText is not present) when the action is triggered.
   */
  text: string
  /**
   * The text to be sent back to the bot
   */
  payload?: string
  /**
   * data containing anything we see fit to be sending back to the backend
   */
  value?: object
}

/** represents a text response that is NOT added to the chat feed */
export interface ActivityPostBackAction extends BaseActivityAction {
  type: ActivityActionType.postBack
  /**
   * value is transmitted in the text field of the generated update message
   */
  payload: string
}

/** Opens a URL. */
export interface ActivityOpenUrlAction extends BaseActivityAction {
  type: ActivityActionType.openUrl
  /** URL to be opened. */
  value: string
}

export interface ActivityDownloadFileAction extends BaseActivityAction {
  type: ActivityActionType.downloadFile
  /** URL to the file to be downloaded. */
  value: string
}

export interface ActivityShowImageFileAction extends BaseActivityAction {
  type: ActivityActionType.showImage
  /** URL to the image to be displayed. */
  value: string
}

export interface ActivitySignInAction extends BaseActivityAction {
  type: ActivityActionType.signIn
  /** URL to be handled by the client in order to sign the user in. */
  value: string
}

export interface ActivityPlayAudioAction extends BaseActivityAction {
  type: ActivityActionType.playAudio
  /** URL to an audio file to be played. */
  value: string
}

export interface ActivityPlayVideoAction extends BaseActivityAction {
  type: ActivityActionType.playVideo
  /** URL to an video file to be played. */
  value: string
}

export interface ActivityCallAction extends BaseActivityAction {
  type: ActivityActionType.call
  /** URL of scheme `tel` that would allow the user to call a number. */
  value: string
}

export interface ActivitySharePhoneNumberAction extends BaseActivityAction {
  type: ActivityActionType.sharePhoneNumber
}

export interface ActivityShareEmailAction extends BaseActivityAction {
  type: ActivityActionType.shareEmail
}

// TODO: We do not support payments yet... I.e. to be defined
// export interface PaymentAction extends BaseAction {
//   type: 'call'
//   /** URL of scheme `tel` that would allow the user to call a number. */
//   value: PaymentRequest
// }

/** Action object. */
export type ActivityAction =
  | ActivityMessageBackAction
  | ActivityPostBackAction
  | ActivityOpenUrlAction
  | ActivityDownloadFileAction
  | ActivityShowImageFileAction
  | ActivitySignInAction
  | ActivityPlayAudioAction
  | ActivityPlayVideoAction
  | ActivityCallAction
  | ActivitySharePhoneNumberAction
  | ActivityShareEmailAction
