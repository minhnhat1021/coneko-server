const express = require('express')
const router = express.Router()
const loginMiddleware = require('../app/middlewares/loginMiddleware')
const aboutController = require('../app/controllers/AboutController')


// about

router.post('/',loginMiddleware, aboutController.about)


module.exports = router 