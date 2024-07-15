const express = require('express')
const router = express.Router()

const usersController = require('../app/controllers/UsersController')


// user controller
router.get('/search', usersController.findUser)
router.get('/', usersController.index)


module.exports = router 