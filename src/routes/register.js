const express = require('express')
const router = express.Router()

const registerController = require('../app/controllers/RegisterController')


// user controller
router.get('/infoRegister', registerController.getInfoRegister)

router.post('/', registerController.register)



module.exports = router 