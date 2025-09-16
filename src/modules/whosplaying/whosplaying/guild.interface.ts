export interface ActivityLite {
  name: string | null
  details: string | null
  state: string | null
  party: {
    size: number
  } | null
}

export interface MemberLite {
  displayName: string
  activities: ActivityLite[]
}
