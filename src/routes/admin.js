const express = require('express')
const router = express.Router()
const multer = require('multer')


const loginMiddleware = require('../app/middlewares/loginMiddleware')
const uploadMiddleware = require ('../app/middlewares/uploadMiddleware')

const adminController = require('../app/controllers/AdminController')



// user controller
router.post('/upload', uploadMiddleware,  adminController.uploadRoom)
router.post('/create-room',  adminController.createRoom)

router.get('/statistics-room',  adminController.statisticsRoom)
router.get('/room-list',  adminController.showRoom)


module.exports = router 