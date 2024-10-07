const express = require('express')
const router = express.Router()
const multer = require('multer')


const loginMiddleware = require('../app/middlewares/loginMiddleware')
const uploadMiddleware = require ('../app/middlewares/uploadMiddleware')

const adminController = require('../app/controllers/AdminController')


router.get('/user',  adminController.User)

router.get('/banned-users',  adminController.bannedUsers)

router.delete('/user-ban',  adminController.userBan)
router.delete('/user-force',  adminController.forceDeleteUser)
router.patch('/user-restore',  adminController.restoreUser)

// Room controller

router.get('/room',  adminController.Room)
router.get('/statistics-room',  adminController.statisticsRoom)
router.get('/trash-rooms',  adminController.trashRooms)

router.post('/upload', uploadMiddleware,  adminController.uploadRoom)
router.post('/create-room',  adminController.createRoom)
router.get('/:id/room-edit',  adminController.editRoom)
router.put('/room-update',  adminController.updateRoom)
router.delete('/room-delete',  adminController.deleteRoom)
router.delete('/room-force',  adminController.forceDeleteRoom)
router.patch('/room-restore',  adminController.restoreRoom)

// Booking management
router.get('/booking-management',  adminController.bookingManagement)
module.exports = router 