const express = require('express')
const router = express.Router()

const loginController = require('../app/controllers/LoginController')


// user controller
router.post('/userActive', loginController.login)
router.get('/userActive', loginController.getLoginActive)



module.exports = router 