import express from 'express'
// import paymentController from '@controller/paymentController';
// const authController = require('../controller/authController');

const router = express.Router({ mergeParams: true })

// router.route('/verify').post(paymentController.verifyPayment);
// // .patch(
// //   authController.restrictTo('admin', 'teacher'),
// //   paymentController.updateLesson
// // )
// // .delete(authController.restrictTo('admin'), paymentController.deleteLesson);

// router
//   .route('/')
//   //   .get(paymentController.getAllLessons)
//   .get(
//     // authController.restrictTo('admin', 'teacher'),
//     paymentController.createNewPayment
//   );

export default router
