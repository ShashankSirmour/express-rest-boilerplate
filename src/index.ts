import mongoose from 'mongoose'
import winston from 'winston'
import dotenv from 'dotenv'
dotenv.config()

import app from './app'

const DB = process.env.DATABASE_URL.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB)
  .then(() => {
    console.info('db connection sucessful')
  })
  .catch(() => {
    winston.error('error in db connection')
  })

// SERVER
const port = process.env.APP_PORT || 8080

const server = app.listen(port, () => {
  console.log(`app is running on ${port}`)
})

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down... ')
  console.log(err)
  server.close(() => {
    process.exit(1)
  })
})

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down... ')
  console.log(err)
  server.close(() => {
    process.exit(1)
  })
})
