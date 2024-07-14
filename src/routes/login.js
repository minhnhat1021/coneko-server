const express = require('express')
const router = express.Router()

const loginController = require('../app/controllers/LoginController')


// user controller
router.get('/infoLogin', loginController.getLoginActive)

router.post('/', loginController.login)



module.exports = router 