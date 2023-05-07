import crypto from 'crypto'
import { AppError, withCatchAsync } from '@lib/errorhandler'
import User, { UserType } from '@model/userModel'
import { userMailer } from '@lib/mailer'
import { blackListObjField } from '@utils/objectHelper'
import { CookieOptions } from './types'
import { AppRequest } from '@apptypes/request'

import jwt, { JwtPayload } from 'jsonwebtoken'
import { Response } from 'express'

const verifyJwtAsync = async (
  token: string,
  secret: string
): Promise<JwtPayload> => {
  try {
    const payload: JwtPayload = await new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(err)
        } else {
          resolve(decoded as JwtPayload)
        }
      })
    })
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

const signToken = (id: string) => {
  return jwt.sign(
    {
      id: id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES
    }
  )
}

const createAndSendToken = (
  user: UserType,
  statusCode: number,
  res: Response
) => {
  const token = signToken(user.id)
  const expire = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  )
  const cookieOptions: CookieOptions = {
    expires: expire,
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true
    cookieOptions.sameSite = 'none'
  }

  res.cookie('jwt', token, cookieOptions)

  //remove user password in send
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

// done by admin
export const register = withCatchAsync(async (req, res) => {
  const userData = req.body
  const newUser: UserType = await User.create(userData)
  createAndSendToken(newUser, 201, res)
})

// done by user
export const signup = withCatchAsync(async (req, res) => {
  const userData = blackListObjField(req.body, 'role')
  const newUser = await User.create(userData)
  createAndSendToken(newUser, 201, res)
})

export const login = withCatchAsync(async (req, res) => {
  const { email, password } = req.body

  //check email and password exist
  if (!email || !password)
    return new AppError('user email and password is required ', 400)

  //check email and password correct
  const user = await User.findOne({ email }).select('+password')

  const isCorrect =
    !user?.password || !(await user.correctPassword(password, user.password))
  if (isCorrect) {
    return new AppError('either email or password is wrong', 401)
  }
  //everthing is ok then send token
  createAndSendToken(user, 200, res)
})

export const protectedRoute = withCatchAsync<AppRequest>(
  async (req, res, next) => {
    if (req.user) next()
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt
    }
    if (!token)
      return next(
        new AppError('You are not login.login first to get access.', 401)
      )

    const decoded = await verifyJwtAsync(token, process.env.JWT_SECRET)
    //check if user still exist
    const freshUser: UserType | null = await User.findById(decoded.id)

    if (!freshUser)
      return next(
        new AppError(
          'User Belong To This Token No Longe Exist  try Login again',
          401
        )
      )

    //check if password changed
    if (decoded.iat && freshUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User Recently Changed The Password LogIn Again', 401)
      )
    }
    //grant acess to next route
    req.user = freshUser
    next()
  }
)

// export const restrictTo = (...role) => {
//   return (req, res, next) => {
//     if (!role.includes(req.user.role))
//       return next(
//         new AppError('This User Dont Have Access To Perform Action', 403)
//       );
//     next();
//   };
// };

export const forgotPassword = withCatchAsync(async (req, res, next) => {
  //get user posted email
  const user = await User.findOne({ email: req.body.email })
  if (!user)
    return next(new AppError('there is no user with email address', 404))

  //genrate random reset token
  const resetToken = user.createPasswordResetToken()
  user.save({ validateBeforeSave: false })

  //send it to user mail

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/user/resetPassword/${resetToken}
  }`

  try {
    await userMailer.resetPassword({
      email: 'shashank.sirmour11@gmail.com',
      resetUrl
    })
    res.status(200).json({
      status: 'success',
      message: 'token sent to mail'
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    throw new AppError(
      `${error} there was an error sending email try again later`,
      500
    )
  }
})

export const resetPassword = withCatchAsync(async (req, res, next) => {
  //get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  //if token has not expired and there is user set the new password
  if (!user) return next(new AppError('token is invalid or has expired', 400))

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()
  //update changePasswordAt property

  //log  user in,send jwt
  createAndSendToken(user, 200, res)
})

export const updatePassword = withCatchAsync<AppRequest>(async (req, res) => {
  const { passwordCurrent, password, passwordConfirm } = req.body

  //Get user from collection
  const user = await User.findById(req.user.id).select('+password')
  //check if posted current password is correct
  if (!user) throw new AppError('user not found', 404)

  const isCorrect =
    user.password &&
    (await user.correctPassword(passwordCurrent, user.password))

  if (!isCorrect) {
    throw new AppError('current password is wrong', 401)
  }
  //update password
  user.password = password
  user.passwordConfirm = passwordConfirm

  await user.save() //we did this because update not run validation and pre save meddleware to encrypt and update change password at

  //Log user in send JWT
  createAndSendToken(user, 201, res)
})
