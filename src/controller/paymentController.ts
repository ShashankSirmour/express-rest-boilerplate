import { withCatchAsync, AppError } from '@lib/errorhandler'

// import { createOrder, verifyAndCapturePayment } from '../util/payment'

// exports.createNewPayment = withCatchAsync(async (req, res, next) => {
//   //   const newPayment = await Payment.create({
//   //     ...req.body,
//   //     course: req.params.courseID,
//   //   });

//   //   newPayment.topics = [];
//   const order = await createOrder()
//   // if(order) // store user order id and refresh list of bill numbers wanted to pay
//   res.status(200).json({
//     status: 'success',
//     data: order
//   })
// })

// exports.verifyPayment = withCatchAsync(async (req, res, next) => {
//   const { orderID, paymentID, signature } = req.body

//   const verifiedAndCaptured = await verifyAndCapturePayment({
//     orderID,
//     paymentID,
//     signature
//   })

//   if (!verifiedAndCaptured) {
//     return new AppError(
//       'failed to capture or verify. payment will get Refunded within 5-7 days if deducted',
//       500
//     )
//   }

//   try {
//     // do all db stuff
//     // add paymentid and paid status | search in db by orderId
//     // make due payment done in feeModal in all the list map to that order id
//   } catch (error) {
//     // refundPayment();
//     return next(
//       new AppError(
//         'failed to do opration.payment will get Refunded within 5-7 days if deducted',
//         500
//       )
//     )
//   }

//   res.status(200).json({
//     status: 'success',
//     data: verifiedAndCaptured
//   })
// })

// // exports.getPayment = withCatchAsync(async (req, res, next) => {
// //   const Payment = await Payment.findById(
// //     req.params.PaymentID
// //   ).populate('topics', '-__v', null, { sort: { number: 1 } });

// //   if (!Payment) {
// //     return next(new AppError('No Payment Found with This ID', 404));
// //   }

// //   res.status(200).json({
// //     status: 'success',
// //     data: Payment,
// //   });
// // });

// // exports.updatePayment = withCatchAsync(async (req, res, next) => {
// //   const Payment = await Payment.findByIdAndUpdate(
// //     req.params.PaymentID,
// //     req.body,
// //     {
// //       new: true,
// //       runValidators: true,
// //     }
// //   );

// //   if (!Payment) {
// //     return next(new AppError('No Payment Found with This ID', 404));
// //   }

// //   res.status(200).json({
// //     status: 'success',
// //     data: Payment,
// //   });
// // });

// // exports.deletePayment = withCatchAsync(async (req, res, next) => {
// //   const Payment = await Payment.findByIdAndDelete(req.params.PaymentID);
// //   if (!Payment) {
// //     return next(new AppError('No Payment found with That ID', 404));
// //   }

// //   res.status(204).json({
// //     status: 'success',
// //     data: null,
// //   });
// // });
