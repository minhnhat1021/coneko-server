const User = require('../models/User')
const Room = require('../models/Room')

class UserController {


    userDetail(req, res, next) {
        User.findOne({fullName: req.params.name})
            .then(user => res.json(user))
    }
    // [Get] /user/account
    show(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/account
    account(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/account
    purchase(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/account
    bookingHistory(req, res, next) {
        res.json(req.user)
    }
    
    // [Get] /user/account
    favoriteRooms(req, res, next) {
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

    // [Get] /user/search
    findUser(req, res) {
        const {q} = req.query
        User.findOne({userName: req.query.q}) 
            .then((user) => {

                if(user) {
                    res.status(200).json({ msg: 'Đã tìm thấy tài khoản', user })
                }else {
                    res.json({msg: 'Không tìm thấy tài khoản này'})
                }
            })    
    }
}

module.exports = new UserController