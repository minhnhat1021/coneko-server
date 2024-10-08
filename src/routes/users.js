
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const usersController = require('../app/controllers/UsersController')


// user controller
router.get('/search', usersController.findUser)
router.get('/', usersController.userList)
router.post('/filter-options', usersController.filterUsersByOptions)

module.exports = router 