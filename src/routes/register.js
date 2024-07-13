const express = require('express')
const router = express.Router()

const registerController = require('../app/controllers/RegisterController')


// user controller
router.post('/', registerController.create)



module.exports = router 