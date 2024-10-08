const User = require('../models/User')
const Room = require('../models/Room')

class UserController {


    userDetail(req, res, next) {
        User.findOne({fullName: req.params.name})
            .then(user => res.json(user))
    }
    // [Get] /user/account
    show(req, res, next) {
        res.json( req.user )
    }

    // [Get] /user/account
    account(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/purchase
    purchase(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/booking-history
    bookingHistory(req, res, next) {
        res.json(req.user)
    }
    
    // [Get] /user/favorite-rooms
    favoriteRooms(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/current-rooms
    currentRooms(req, res, next) {
        res.json(req.user)
    }

    paycard(req, res, next) {
        res.json(req.user)
    }

    // [Patch] /favorite-rooms/add

    async addFavoriteRooms(req, res, next) {
        try {
            const { userId, roomId } = req.body

            const user = await User.findById(userId)
            const room = await Room.findById(roomId)
            if (!user) {
                return res.status(404).json({ msg: 'User đang thanh toán không khả dụng' })
            }
            user.favoriteRooms.push(room)
            await user.save()

            res.json({ data: { msg: 'Lưu thành công' } })

        } catch(err) {
            next(err)
        }
    }

    // [Patch] /favorite-rooms/remove

    async removeFavoriteRooms(req, res, next) {
        try {
            const { userId, roomId } = req.body

            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ msg: 'User đang thanh toán không khả dụng' })
            }
            user.favoriteRooms = user.favoriteRooms.filter(function(a) {
                return a._id.toString() !== roomId
            })
            
            await user.save()

            res.json({ data: { msg: 'Bỏ lưu thành công' } })
            
        } catch(err) {
            next(err)
        }
    }

    // [Get] /user/find-user/id
    findUserById(req, res) {
        const { userId } = req.body

        if(!userId) {
            User.find({}) 
            .then((user) => {
                if(user) {
                    return res.status(200).json({ data: {msg: 'Đã tìm thấy tài khoản', user} })
                }else {
                    return res.json({ data: {msg: 'Không tìm thấy tài khoản này'} })
                }
            })    
        } else if (userId) {
            User.findById( userId ) 
            .then((user) => {

                if(user) {
                    res.status(200).json({ data: {msg: 'Đã tìm thấy tài khoản', user} })
                }else {
                    res.json({ data: {msg: 'Không tìm thấy tài khoản này'} })
                }
            }) 
        }
           
    }

    // [Get] /user/find-user/username
    findUserByUserName(req, res) {
        const { userName } = req.body

        if(!userName) {
            User.find({}) 
                .then((user) => {
                    if(user) {
                        return res.status(200).json({ data: {msg: 'Đã tìm thấy tài khoản', user} })
                    }else {
                         return res.json({ data: {msg: 'Không tìm thấy tài khoản này'} })
                    }
                })    
        }
        else if(userName) {
            User.find({ userName: { $regex: userName, $options: "i" }}) 
            .then((user) => {

                if(user) {
                    res.status(200).json({ data: {msg: 'Đã tìm thấy tài khoản', user} })
                }else {
                    res.json({ data: {msg: 'Không tìm thấy tài khoản này'} })
                }
            })   
        }
    }
}

module.exports = new UserController