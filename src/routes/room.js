
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const roomController = require('../app/controllers/RoomController')


// user controller
router.get('/:name/room-detail', roomController.roomDetail)
router.get('/:id', roomController.findRoomById)
router.post('/payment', roomController.roomPayment)

module.exports = router 