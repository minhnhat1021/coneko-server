const express = require('express')
const router = express.Router()

const userController = require('../app/controllers/UserController')


// user controller
router.get('/search', userController.findUser)
router.get('/account', userController.account)
router.get('/', userController.index)


module.exports = router 