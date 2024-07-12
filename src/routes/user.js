const express = require('express')
const router = express.Router()

const usersController = require('../app/controllers/UsersController')


// user controller
router.use('/:id', usersController.show)
router.use('/', usersController.index)


module.exports = router 