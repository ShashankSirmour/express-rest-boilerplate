const FAIL = 'fail'
const ERROR = 'error'

class AppError extends Error {
  statusCode: number
  status: string
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? FAIL : ERROR
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export default AppError
