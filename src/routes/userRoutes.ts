import express from 'express'
import userController from '@controller/userController'
import authController from '@controller/authController'

const router = express.Router()

router.route('/signup').post(authController.signup)

router.route('/login').post(authController.login)
router.route('/forgotPassword').post(authController.forgotPassword)
router.route('/resetPassword/:token').patch(authController.resetPassword)

router.route('/register').post(authController.register)

router.use(authController.protectedRoute)

router.route('/updateMyPassword').patch(authController.updatePassword)
router.route('/updateMe').patch(userController.updateMe)

router.route('/').get(userController.getAllUsers) //TODO: restrict to admin only
router.route('/me').get(userController.getUser)

export default router
