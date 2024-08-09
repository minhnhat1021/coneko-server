const express = require('express')
const router = express.Router()
const multer = require('multer')


const loginMiddleware = require('../app/middlewares/loginMiddleware')
const uploadMiddleware = require ('../app/middlewares/uploadMiddleware')

const adminController = require('../app/controllers/AdminController')




router.get('/user',  adminController.User)
router.get('/user-list',  adminController.userList)


router.get('/banned-users',  adminController.bannedUsers)

router.delete('/:id/user-ban',  adminController.userBan)
router.delete('/:id/user-force',  adminController.forceDeleteUser)
router.patch('/:id/user-restore',  adminController.restoreUser)

// Room controller

router.get('/room',  adminController.Room)
router.get('/statistics-room',  adminController.statisticsRoom)
router.get('/room-list',  adminController.showRoom)
router.get('/room-trash',  adminController.roomTrash)

router.post('/upload', uploadMiddleware,  adminController.uploadRoom)
router.post('/create-room',  adminController.createRoom)
router.get('/:id/room-edit',  adminController.editRoom)
router.put('/:id/room-update',  adminController.updateRoom)
router.delete('/:id/room-delete',  adminController.deleteRoom)
router.delete('/:id/room-force',  adminController.forceDeleteRoom)
router.patch('/:id/room-restore',  adminController.restoreRoom)


module.exports = router 