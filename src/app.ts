import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import hpp from 'hpp'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import xss from 'xss-clean'
import cookieParser from 'cookie-parser'
import { AppError, globalErrorHandler } from '@lib/errorhandler'
import corsHandler from './middleware/cors'
import userRoutes from '@routes/userRoutes'
import paymentRoute from '@routes/paymentRoute'
import winston from 'winston'

const app = express()

app.use(corsHandler())

//Set Security HTTP header
app.use(helmet())

winston.add(new winston.transports.File({ filename: 'logfile.log' }))
//Devlopment Logging
if (process.env.NODE_ENV === 'devlopment') {
  console.log('morgan in dev mode started')
  app.use(morgan('dev'))
}

//rate Limit
const limiter = rateLimit({
  max: 100,
  windowMs: 10 * 60 * 1000
})

app.use('/api', limiter)

//  cookieParser
app.use(cookieParser())
// Body parser
app.use(express.json({ limit: '10kb' }))

//Data sanitize against noSql  query injection
app.use(mongoSanitize())

//Data Sanitize against xss
app.use(xss())

//Secure from http parameter pollut
app.use(hpp({ whitelist: ['duration', 'price'] })) //ass more as per choise

//static file
app.use(express.static(`${__dirname}/public`))

// //Test middileware may come in use later for
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/payment', paymentRoute)

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)

export default app
