import nodemailer, { Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import Email from 'email-templates'

import path from 'path'
import winston from 'winston'

export abstract class Mailer {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>

  protected mailer: Email

  constructor() {
    try {
      this.createTransporter()
      this.initializeMailer()
    } catch (error) {
      winston.error(error)
    }
  }

  private initializeMailer() {
    this.mailer = new Email({
      views: {
        root: path.join(__dirname, 'templates'),
        locals: {
          clientUrl: process.env.CLIENT_URL || 'testing url'
        },
        options: { extension: 'ejs' }
      },
      preview: false,
      send: true,
      transport: this.transporter
    })
  }

  private createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    })
  }
}
