
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const userController = require('../app/controllers/UserController')


// user controller

router.post('/purchase/list', loginMiddleware,  userController.purchase)
router.post('/account', loginMiddleware,  userController.account)
router.post('/mybooking', loginMiddleware,  userController.mybooking)
router.post('/paycard', loginMiddleware,  userController.paycard)


module.exports = router 