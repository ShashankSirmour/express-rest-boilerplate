export type CookieOptions = {
  expires: Date
  httpOnly: boolean
  secure?: boolean
  sameSite?: boolean | 'none' | 'lax' | 'strict'
}
