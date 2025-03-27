import { createHash, createHmac } from 'crypto'

import envConfig from '@/configs/env.config'

export const CTIME = String(Math.floor(Date.now() / 1000))

export const getHash256 = (data: string): string => {
  return createHash('sha256').update(data).digest('hex')
}

export const getHmac512 = (data: string, key: string): string => {
  const hmac = createHmac('sha512', key)
  return hmac.update(Buffer.from(data, 'utf8')).digest('hex')
}

export function hashParamNoId(path: string): string {
  return getHmac512(
    path + getHash256(`ctime=${CTIME}version=${envConfig.ZING_MP3_API_VERSION}`),
    envConfig.ZING_MP3_SECRET_KEY
  )
}

export function hashParam(path: string, id: string): string {
  return getHmac512(
    path + getHash256(`ctime=${CTIME}id=${id}version=${envConfig.ZING_MP3_API_VERSION}`),
    envConfig.ZING_MP3_SECRET_KEY
  )
}

export function hashParamHome(path: string): string {
  return getHmac512(
    path + getHash256(`count=30ctime=${CTIME}page=1version=${envConfig.ZING_MP3_API_VERSION}`),
    envConfig.ZING_MP3_SECRET_KEY
  )
}

export function hashCategoryMV(path: string, id: string, type: string): string {
  return getHmac512(
    path + getHash256(`ctime=${CTIME}id=${id}type=${type}version=${envConfig.ZING_MP3_API_VERSION}`),
    envConfig.ZING_MP3_SECRET_KEY
  )
}

export function hashListMV(path: string, id: string, type: string, page: string, count: string): string {
  return getHmac512(
    path +
      getHash256(
        `count=${count}ctime=${CTIME}id=${id}page=${page}type=${type}version=${envConfig.ZING_MP3_API_VERSION}`
      ),
    envConfig.ZING_MP3_SECRET_KEY
  )
}

export function hashSearchAll(path: string, type: string, page: string, count: string): string {
  return getHmac512(
    path + getHash256(`count=${count}ctime=${CTIME}page=${page}type=${type}version=${envConfig.ZING_MP3_API_VERSION}`),
    envConfig.ZING_MP3_SECRET_KEY
  )
}

export function hashSuggest(path: string): string {
  return getHmac512(
    path + getHash256(`ctime=${CTIME}version=${envConfig.ZING_MP3_API_VERSION}`),
    envConfig.ZING_MP3_SECRET_KEY
  )
}
