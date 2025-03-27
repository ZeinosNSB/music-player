import { z } from 'zod'

const envSchema = z.object({
  API_ENDPOINT: z.string(),
  DATABASE_URL: z.string(),
  PRODUCTION: z.enum(['true', 'false']).transform(val => val === 'true'),
  PRODUCTION_URL: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ZING_MP3_API_KEY: z.string(),
  ZING_MP3_SECRET_KEY: z.string(),
  ZING_MP3_API_URL: z.string(),
  ZING_MP3_API_VERSION: z.string()
})

export type EnvConfig = z.infer<typeof envSchema>

const configServer = envSchema.safeParse(process.env)

if (!configServer.success) {
  console.error(configServer.error.issues)
  throw new Error('Invalid environment variables')
}

const envConfig = configServer.data

export const API_URL = envConfig.PRODUCTION ? envConfig.PRODUCTION_URL : envConfig.API_ENDPOINT

export default envConfig
