const express = require('express')
const router = express.Router()

const loginController = require('../app/controllers/LoginController')
const loginMiddleware = require('../app/middlewares/loginMiddleware')

// user controller
router.get('/infoLogin', loginController.getLoginActive)
router.post('/out', loginMiddleware, loginController.logout)
router.post('/reset-password', loginController.resetPassword)

router.post('/google', loginController.googleLogin)
router.post('/facebook', loginController.facebookLogin)

router.post('/', loginController.login)



module.exports = router 