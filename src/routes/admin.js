const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const adminController = require('../app/controllers/AdminController')



// user controller
router.post('/create-room',  adminController.createRoom)
router.get('/room-list',  adminController.showRoom)


module.exports = router 