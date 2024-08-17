
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const roomsController = require('../app/controllers/RoomsController')


// user controller
router.get('/', roomsController.showRooms)

module.exports = router 