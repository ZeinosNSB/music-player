export const TokenType = {
  AccessToken: 'AccessToken',
  RefreshToken: 'RefreshToken'
} as const

export type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType]
