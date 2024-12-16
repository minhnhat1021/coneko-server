
const express = require('express')
const router = express.Router()

const loginMiddleware = require('../app/middlewares/loginMiddleware')
const userController = require('../app/controllers/UserController')

// user controller
router.post('/userDetails', loginMiddleware,  userController.userDetail)
router.get('/:name', userController.userByName)
router.patch('/update-info',  userController.userUpdateInfo)
router.patch('/update-password',  userController.userUpdatePassword)

router.patch('/favorite-rooms/add',  userController.addFavoriteRooms)
router.patch('/favorite-rooms/remove',  userController.removeFavoriteRooms)

router.post('/find-user/username',  userController.findUserByUserName)
router.post('/guest-inquiry',  userController.guestInquiry)



module.exports = router 