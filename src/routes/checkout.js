
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const checkoutController = require('../app/controllers/CheckoutController')


// Checkout controller



router.post('/coneko', checkoutController.conekoCheckout)

router.post('/paypal', checkoutController.payPalCheckout)
router.post('/paypal/confirm', checkoutController.confirmPayPalCheckout)

router.post('/vnpay', checkoutController.vnPayCheckout)
router.post('/vnpay/confirm', checkoutController.confirmVnPayCheckout)
router.post('/vnpay/save', checkoutController.saveVnPayCheckout)

router.post('/zalopay', checkoutController.zaloPayCheckout)
router.post('/zalopay/confirm', checkoutController.confirmZaloPayCheckout)
router.post('/zalopay/status/:apptransid', checkoutController.statusZaloPayCheckout)
router.post('/zalopay/save', checkoutController.saveZaloPayCheckout)





module.exports = router 