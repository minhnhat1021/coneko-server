
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const roomsController = require('../app/controllers/RoomsController')


// user controller
router.get('/', roomsController.showRooms)
router.get('/search', roomsController.searchRooms)

module.exports = router 