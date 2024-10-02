const express = require('express')
const router = express.Router()

const loginController = require('../app/controllers/LoginController')


// user controller
router.get('/infoLogin', loginController.getLoginActive)
router.post('/out', loginController.logout)

router.post('/google', loginController.googleLogin)

router.post('/', loginController.login)



module.exports = router 