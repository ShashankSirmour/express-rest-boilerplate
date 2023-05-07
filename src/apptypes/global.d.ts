export declare global {
  namespace Express {
    interface Request {
      context: Context
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: number
      APP_URL: string

      DATABASE_PASSWORD: string
      DATABASE_URL: string

      REDIS_URI: string
      REDIS_TOKEN_EXPIRATION: number

      JWT_SECRET: string
      JWT_COOKIE_EXPIRES_IN: number

      MAIL_HOST: string
      MAIL_PORT: number
      MAIL_USERNAME: string
      MAIL_PASSWORD: string

      STORAGE_PATH: string
    }
  }
}
