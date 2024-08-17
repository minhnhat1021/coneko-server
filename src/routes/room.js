
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const roomController = require('../app/controllers/RoomController')


// user controller
router.get('/:name/room-detail', roomController.roomDetail)

module.exports = router 