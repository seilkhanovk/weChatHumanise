/** Conversation object. */
export interface ActivityConversation {
  id: string
  /** might be useful in the future to be able to reference a conversation by name */
  name?: string
  /** used currently in the actual conversation table */
  customerProfileId?: string
  /** used currently in the actual conversation table */
  channelId?: string
  /** Whether there is more than two participants in the conversation */
  isGroup?: boolean
  // NOTE: this type is obviously wrong, but cbf right now...
  participants?: any[]
}
