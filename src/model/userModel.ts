import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface UserType extends mongoose.Document {
  name: {
    firstName: string
    lastName: string
  }
  email: string
  password: string | undefined
  passwordConfirm: string | undefined
  passwordChangedAt: Date
  passwordResetToken: string | undefined
  passwordResetExpires: Date | undefined
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>
  changedPasswordAfter: (JWTTimestamp: number) => boolean
  createPasswordResetToken: () => string
}

const userSchema = new mongoose.Schema({
  name: {
    firstName: {
      type: String,
      required: [true, 'Please Specify Your First Name']
    },
    lastName: {
      type: String,
      required: [true, 'Please Specify Your Last Name']
    }
  },

  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email']
  },
  // role: {
  //   type: String,
  //   enum: ['user', 'doctor', 'admin'],
  //   default: 'user'
  // },
  password: {
    type: String,
    required: [true, 'please pride a password'],
    minlength: [8, 'password must beat least 8 character'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [
      function (this: UserType) {
        return this.password != null
      },
      'please provide a password contirmation'
    ],
    validate: {
      //this is only work on on save or create
      validator: function (this: UserType, el: string) {
        return el === this.password
      },
      message: 'Password are not same'
    }
  },

  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  //onlyh run if password modified and contain value
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangeAt = new Date(Date.now() - 1000)
  next()
})

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = parseInt(
      (this.passwordChangeAt.getTime() / 1000).toString(),
      10
    )

    return JWTTimestamp < changedTimeStamp
  }
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}

const User = mongoose.model<UserType>('User', userSchema)

export default User
