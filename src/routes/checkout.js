
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const checkoutController = require('../app/controllers/CheckoutController')


// Checkout controller



router.post('/coneko', checkoutController.conekoCheckout)

router.post('/paypal', checkoutController.payPalCheckout)
router.post('/paypal/confirm', checkoutController.confirmPayPalCheckout)

router.post('/vnpay', checkoutController.vnPayCheckout)




module.exports = router 