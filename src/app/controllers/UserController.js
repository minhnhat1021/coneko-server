const User = require('../models/User')
const Room = require('../models/Room')
const GuestInquiry = require('../models/GuestInquiry')

const bcrypt = require('bcrypt')
class UserController {

    //[GET]  api test username
    userByName(req, res, next) {
        User.findOne({ userName: req.params.name })
           .then(user => res.json(user))
           .catch(err => next(err))
    }
    //[Post] /userDetails
    userDetail(req, res, next) {
        res.json( req.user )
    }
    //[Post] /userDetails
    async guestInquiry(req, res, next) {
        const { fullName, email, phone, address, numberOfPeople,preferences } = req.body?.payload
        await GuestInquiry.create({fullName, email, phone, address, numberOfPeople,preferences})
        res.json( {data: {status: 200, msg: 'Chúng tôi đã nhận được phản hồi từ bạn, đội ngũ tư vấn sẽ sớm liên hệ lại'}} )
    }
    
    async userUpdateInfo (req, res, next) {
        const id = req.body.id
        const { fullName,userName, email, phone } = req.body?.payload
        await User.updateOne(
            { _id: id }, 
            { fullName, userName, email, phone } 
        )
        
        res.json( {data: {status: 200, msg: 'Đổi thông tin thành công'}} )
    }
    
    async userUpdatePassword (req, res, next) {
        const id = req.body.id
        const { password, newPassword} = req.body?.payload
        User.findOne({_id: id}) 
            .then((user) => {
                if(user) {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (isMatch) {
                            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                                if (err) {
                                    throw new Error('lỗi mã hóa mật khẩu');
                                }
                                User.updateOne({ _id: id }, { password : hashedPassword})
                                .then(() => {
                                    return res.status(200).json({ data: {status: 200, msg: 'Đổi mật khẩu thành công'} })
                                })
                            })
                            
                        } else {
                            return res.json({ data: {status: 400, msg: 'Mật khẩu cũ không chính xác'} })
                        }
                    })   
                }else {
                    res.json({ data: {status: 400, msg: 'Tài khoản này chưa được đăng ký'} })
                }
            })  
        // res.json( {data: {status: 200, msg: 'Đổi thông tin thành công'}} )
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