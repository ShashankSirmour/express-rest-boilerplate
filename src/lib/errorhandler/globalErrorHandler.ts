import { ErrorRequestHandler, Response } from 'express'
import AppError from './AppError'
import winston from 'winston'

const handleCastErrorDB = (error: any) => {
  const message = `Invalid ${error.path}: ${error.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (error: any) => {
  const value = Object.values(error.keyValue)
  const message = `Duplicate Field value: ${value}. Please use another value`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (error: any) => {
  const errors = Object.values(error.errors).map(
    (err: any) => err?.properties?.message
  )
  const message = `Invalid input data ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = () =>
  new AppError('Invalid Token Please Login  again', 401)

const handleTokenExpiredError = () =>
  new AppError('Token expired Please Login again', 401)

// error handling messageFFFFFF

const sendErrorDev = (error: any, res: Response) =>
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack
  })

const sendErrorProd = (error: AppError, res: Response) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    })
  } else {
    //no leak of error
    winston.error('ERROR', error)
    res.status(500).json({
      status: 'error',
      message: 'someting went wrong'
    })
  }
}

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500
  error.status = error.status || 'error'

  if (process.env.NODE_ENV === 'devlopment') {
    sendErrorDev(error, res)
  } else if (process.env.NODE_ENV === 'production') {
    let appError = new AppError('someting went wrong', 500)

    if (error.name === 'CastError') appError = handleCastErrorDB(error)

    if (error.code === 11000) appError = handleDuplicateFieldsDB(error)

    if (error.name === 'ValidationError')
      appError = handleValidationErrorDB(error)

    if (error.name === 'JsonWebTokenError') appError = handleJWTError()

    if (error.name === ' TokenExpiredError')
      appError = handleTokenExpiredError()

    sendErrorProd(appError, res)
  }
}

export default globalErrorHandler
