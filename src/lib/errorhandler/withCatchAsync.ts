import { NextFunction, Request, Response } from 'express'
import AppError from './AppError'

export type CatchAsyncType<T> = (
  arg0: T,
  arg1: Response,
  arg2: NextFunction
) => Promise<unknown>

const withCatchAsync = <T = Request>(fn: CatchAsyncType<T>) => {
  return async (req: T, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      if (error instanceof AppError) {
        next(new AppError(error.message, error.statusCode))
      }
      next(error)
    }
  }
}

export default withCatchAsync
