import User from '@model/userModel'
import { whitelistObjField } from '@utils/objectHelper'
import { withCatchAsync, AppError } from '@lib/errorhandler'
import { AppRequest } from '@apptypes/request'

export const getAllUsers = withCatchAsync(async (req, res) => {
  const users = await User.find()
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users
  })
})

export const getUser = withCatchAsync<AppRequest>(async (req, res) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    status: 'success',
    data: user
  })
})

export const updateMe = withCatchAsync<AppRequest>(async (req, res, next) => {
  //create error if user send password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'this route is not for updating password please use updatePassword route',
        400
      )
    )
  //update user document
  //filter unwanted filed
  const filterBody = whitelistObjField(req.body, 'name', 'email')
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  })
})
