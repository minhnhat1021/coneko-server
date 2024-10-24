
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const roomController = require('../app/controllers/RoomController')

const checkoutRouter = require('./checkout')


// Check out router
router.use('/checkout', checkoutRouter)

// Room controller 
router.get('/:name', roomController.roomDetail)
router.post('/detail/id', roomController.findRoomById)


module.exports = router 