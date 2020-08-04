import { ProfileType } from './testActivities'

/** User object. */
export interface ActivityUser {
  /** ID that uniquely identifies the user. Is a profileId for "customer" and "agent" and an orgId for "bot'" */
  id: string
  organizationId?: string
  type: ProfileType
  fullName?: string
  nickname?: string
  avatarUrl?: string
  email?: string
  phoneNumber?: string
}
