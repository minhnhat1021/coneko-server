const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Room = require('../models/Room')
const User = require('../models/User')
const Booking = require('../models/Booking')
const Admin = require('../models/Admin')

class AdminController {


    adminLogin(req, res, next) {

        const {userName, password} = req.body
        console.log(userName, password)
        Admin.findOne({userName: userName}) 
            .then((admin) => {
                if(admin) {
                    console.log(admin)
                    bcrypt.compare(password, admin.password, (err, isMatch) => {
                        if (isMatch) {
                            //1 tao json webtoken        
                            
                            const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET,  { expiresIn: '1h' });
                
                            Admin.updateOne({ _id: admin._id }, {
                                verifyToken: token
                            })
                                .then(() => {
                                    return res.status(200).json({ data: { msg: 'Đăng nhập thành công', token, adminId: admin._id} })
                                })
                        } else {
                            return res.json({ data: {msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác'} });
                        }
                        
                    })   
                }else {
                    res.json({ data: {msg: 'Tài khoản này chưa được đăng ký'} })
                }
            })     
    }
    // [Get] /admin/user
    async User(req, res, next) {
        try {
            const userList = await User.countDocuments({ })
            const bannedUsers = await User.countDocumentsWithDeleted({ deleted: true })
    
            res.status(200).json({ data: {userList,bannedUsers} })
        } catch (error) {
            res.status(500).json({data: {msg: 'lỗi truy xuất dữ liệu Room'} })
        }
    }

    // [Get] /admin/id/user-ban
    userBan(req, res, next) {
        User.delete({ _id: req.body.userId})
            .then(() => res.json({ data: {msg: 'Ban user thành công'} }))
            .catch(next)
    }

    // [Get] /admin/user-ban
    bannedUsers(req, res, next) {
        User.findWithDeleted({ deleted: true})
           .then(users => res.json({ data: users }))
           .catch(next)
    }
    
    restoreUser(req, res, next) {
        User.restore({ _id: req.body.userId})
            .then(() => res.json({ data: {msg: 'Khôi phục user thành công'} }))
            .catch(next)
    }

    forceDeleteUser(req, res, next) {
        User.deleteOne({ _id: req.body.userId})
            .then(() => res.json({data: {msg: 'Xóa vĩnh viễn user thành công'} }))
            .catch(next)
    }

    // Room ----------------------------------------------------------------
    // [Get] /admin/room
    async Room(req, res, next) {
        try {
            const roomList = await Room.countDocuments({ })
            const roomTrash = await Room.countDocumentsWithDeleted({ deleted: true })
    
            res.status(200).json({ data: {roomList, roomTrash} })
        } catch (error) {
            res.status(500).json({ data: {msg: 'lỗi truy xuất dữ liệu Room'} })
        }
    }

    // [Get] /admin/statisticsRoom  StatisticsRoom-------------------------------------------------
    async statisticsRoom(req, res, next) {
        try {
            const available = await Room.countDocuments({ status: 'available' })
            const booked = await Room.countDocuments({ status: 'booked' })
            const inUse = await Room.countDocuments({ status: 'inUse' })
            const canceled = await Room.countDocuments({ status: 'canceled' })

            const singleBed = await Room.countDocuments({ bedType: 'single' })
            const doubleBed = await Room.countDocuments({ bedType: 'double' })
            const oneBed = await Room.countDocuments({ bedCount: '1' })
            const twoBeds = await Room.countDocuments({ bedCount: '2' })
            const threeBeds = await Room.countDocuments({ bedCount: '3' })

            const onePerson = await Room.countDocuments({ capacity: '1' })
            const twoPeople = await Room.countDocuments({ capacity: '2' })
            const threePeople = await Room.countDocuments({ capacity: '3' })

            const fourStars = await Room.countDocuments({ rating: '4' })
            const fiveStars = await Room.countDocuments({ rating: '5' })

            const smoking = await Room.countDocuments({ smoking: true })
    
            res.status(200).json({
                data: {
                    available,
                    booked,
                    inUse,
                    canceled,
                    singleBed,
                    doubleBed,
                    oneBed,
                    twoBeds,
                    threeBeds,
                    onePerson,
                    twoPeople,
                    threePeople,
                    fourStars,
                    fiveStars,
                    smoking,
                }  
            })
        } catch (error) {
            res.status(500).json({ message: 'lỗi thống kê' })
        }
    }

    // Room List -----------------------------------------------------------------------------------------
    
    editRoom(req, res, next) {
        Room.findById(req.params.id)
            .then(room => res.json({ data: room }))
            .catch(next)
    }
    updateRoom(req, res, next) {
        Room.updateOne({ _id: req.body.roomId}, req.body)
            .then(() => res.json({ data: {msg: 'Update room thành công'} }))
            .catch(next)
    }

    // [DELETE soft] /admin/delete-room
    deleteRoom(req, res, next) {
        Room.delete({ _id: req.body.id})
            .then(() => res.json({ data: {msg: 'Delete room thành công'} }))
            .catch(next)
    }

    // Room Create -----------------------------------------------------------------------------------------

    // [POST] /admin/create-room
    createRoom(req, res, next) {
        const newRoom = new Room(req.body)

        newRoom.save()
            .then(() => res.json({ data: {msg: 'Thêm phòng thành công'} }))
            .catch(next)
    }

    // [POST] /admin/upload
    uploadRoom(req, res, next) {
        console.log(req.file)

        res.json({ data: req.file })

    }

    // Room Trash -----------------------------------------------------------------------------------------
    
    trashRooms(req, res, next) {
        Room.findWithDeleted({ deleted: true})
           .then(rooms => res.json({ data: rooms }))
           .catch(next)
    }

    restoreRoom(req, res, next) {
        Room.restore({ _id: req.body.roomId})
            .then(() => res.json({ data: {msg: 'Khôi phục room thành công'} }))
            .catch(next)
    }

    forceDeleteRoom(req, res, next) {
        Room.deleteOne({ _id: req.body.roomId})
            .then(() => res.json({data: {msg: 'Xóa vĩnh viễn room thành công'} }))
            .catch(next)
    }

    // Booking management ----------------------------------------------

    // [GET] admin/booking-management
    async bookingManagement(req, res, next) {
        const bookings  = await Booking.find({})

        res.json({ data: {msg: 'Toàn bộ dữ liệu về những lần đặt phòng của khách hàng', bookings } })
    }

    // [Post] /booking/filter-options
    
    async filterBookingByOptions(req, res, next) {
        try {
            const { options } = req.body
            let filterCriteria = {}
    
            const level = []
            if (options.includes('silver')) {
                level.push({ amountSpent: { $lte: 20000000 } })
            }
            if (options.includes('gold')) {
                level.push({ amountSpent: { $gt: 20000000, $lt: 50000000 } })
            }
            if (options.includes('platinum')) {
                level.push({ amountSpent: { $gt: 50000000, $lt: 70000000 } })
            }
            if (options.includes('diamond')) {
                level.push({ amountSpent: { $gt: 70000000, $lt: 100000000 } })
            }
            if (options.includes('vip')) {
                level.push({ amountSpent: { $gte: 100000000 } })
            }
            if (level.length === 1) {
                filterCriteria.amountSpent = level[0].amountSpent
            } else if(level.length > 1) {
                filterCriteria = {...filterCriteria, $or: level}
            }

            const bookings = await Booking.find(filterCriteria)
            res.status(200).json({ data: {msg: 'Danh sách giao dịch sau khi lọc', bookings} })

        } catch (error) {
            res.status(500).json({ data: {msg: 'Lỗi lọc giao dịch bằng options'} })
        }
        
    }
    
}

module.exports = new AdminController