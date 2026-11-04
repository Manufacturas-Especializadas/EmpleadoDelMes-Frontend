import type { Identifier } from '@/shared/api/types'
export type Tokens = { accessToken: string; refreshToken: string; expiresIn: number }
export type User = {
  userId: Identifier
  userName: string
  displayName: string | null
  roles: string[]
  mustChangePassword: boolean
}
