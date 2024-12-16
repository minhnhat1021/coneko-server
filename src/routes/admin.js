const express = require('express')
const router = express.Router()
const multer = require('multer')


const adminLoginMiddleware = require('../app/middlewares/adminLoginMiddleware')
const uploadMiddleware = require ('../app/middlewares/uploadMiddleware')

const adminController = require('../app/controllers/AdminController')


router.get('/user',  adminController.User)
router.get('/user/find-by-id/:userId',  adminController.findUserById)

router.post('/login',  adminController.adminLogin)
router.post('/register',  adminController.adminRegister)
router.post('/logout', adminLoginMiddleware,  adminController.adminLogout)

router.post('/adminDetails',adminLoginMiddleware,  adminController.adminDetails)

router.get('/banned-users',  adminController.bannedUsers)

router.delete('/user-ban',  adminController.userBan)
router.patch('/user-restore',  adminController.restoreUser)

router.post('/user-actions',  adminController.userActions)


// Room 

router.get('/room',  adminController.Room)
router.get('/statistics-room',  adminController.statisticsRoom)
router.get('/trash-rooms',  adminController.trashRooms)
router.get('/room/find-by-id/:roomId',  adminController.findRoomById)


router.post('/upload', uploadMiddleware,  adminController.uploadRoom)
router.post('/create-room',  adminController.createRoom)
router.get('/:id/room-edit',  adminController.editRoom)
router.put('/room-update',  adminController.updateRoom)
router.delete('/room-delete',  adminController.deleteRoom)
router.delete('/room-force',  adminController.forceDeleteRoom)
router.patch('/room-restore',  adminController.restoreRoom)

router.post('/room-actions',  adminController.roomActions)


// Booking management
router.post('/booked-list',  adminController.bookedList)
router.post('/booked-cancel',  adminController.bookedCancel)
router.get('/booking-trash',  adminController.bookingTrash)
router.post('/booking/filter-options',  adminController.filterBookingByOptions)
router.post('/booking-actions',  adminController.bookingActions)

router.post('/booking/payment',  adminController.paymentBooking)


module.exports = router 