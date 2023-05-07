import cors, { CorsOptions } from 'cors'

// MIDDLEWARE CORS
const whitelist = [
  'https://eduspace.vercel.app',
  'https://eduspace.now.sh',
  'https://eduspace.sanjeevani.io'
]

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    const isDev = process.env.NODE_ENV === 'devlopment'
    if (
      (typeof origin == 'string' && whitelist.indexOf(origin) !== -1) ||
      isDev
    ) {
      callback(null, true)
    } else {
      callback(new Error(`Origin: ${origin} Not Allowed By CORS `))
    }
  }
}

const corsHandler = (config: CorsOptions = {}) =>
  cors({ credentials: true, ...corsOptions, ...config })

export default corsHandler
