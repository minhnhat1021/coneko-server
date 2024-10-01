
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const userController = require('../app/controllers/UserController')


// user controller
router.post('/', loginMiddleware,  userController.show)
router.get('/:name',  userController.userDetail)

router.post('/purchase/list', loginMiddleware,  userController.purchase)
router.post('/account', loginMiddleware,  userController.account)
router.post('/booking-history', loginMiddleware,  userController.bookingHistory)
router.post('/favorite-rooms', loginMiddleware,  userController.favoriteRooms)
router.post('/current-rooms', loginMiddleware,  userController.currentRooms)
router.post('/paycard', loginMiddleware,  userController.paycard)

router.patch('/favorite-rooms/add',  userController.addFavoriteRooms)
router.patch('/favorite-rooms/remove',  userController.removeFavoriteRooms)



module.exports = router 