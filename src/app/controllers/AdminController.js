const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Room = require('../models/Room')
const User = require('../models/User')
const Booking = require('../models/Booking')
const Admin = require('../models/Admin')

class AdminController {

    
    adminRegister(req, res, next) {

        const {userName, password, securityCode} = req.body

        Admin.findOne({userName: userName}) 
            .then((admin) => {
                if(securityCode !== process.env.JWT_SECRET) {
                    res.json({ data: {msg: 'Mã bảo mật không chính xác '} }) 

                }
                else {
                    if(admin) {
                        res.json({ data: {msg: 'Tài khoản đã tồn tại '} })
    
                    } else {
                        const isActive = true

                        bcrypt.hash(password, 10, (err, hashedPassword) => {
                            if (err) {
                                throw new Error('lỗi mã hóa mật khẩu')
                            }
                            
                            const newAdmin = new Admin({userName, password: hashedPassword, isActive})

                            newAdmin
                                .save()
                                .then(() => {
                                    const token = jwt.sign({ adminId: newAdmin._id }, process.env.JWT_SECRET,  { expiresIn: '1h' })
                                    newAdmin.updateOne({ _id: newAdmin._id }, {
                                        verifyToken: token
                                    })

                                    res.status(200).json({ data: {msg: 'Đăng ký thành công', token } })
                                })
                                .catch(next)
                        })
                    }
                }
            }) 
    }
    adminLogin(req, res, next) {

        const {userName, password} = req.body

        Admin.findOne({userName: userName}) 
            .then((admin) => {
                if(admin) {
                    bcrypt.compare(password, admin.password, (err, isMatch) => {
                        if (isMatch) {
                            const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET,  { expiresIn: '1h' });
                
                            Admin.updateOne({ _id: admin._id }, {
                                verifyToken: token
                            })
                                .then(() => {
                                    return res.status(200).json({ data: { msg: 'Đăng nhập thành công', token} })
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
    //[POST] /admin/logout
    adminLogout(req, res, next) {
        Admin.updateOne({_id: req.admin.data._id}, {
            verifyToken: ''
        })
            .then(() => res.json({data: {msg: 'Đã hết phiên đăng nhập'} }))
    }

    //[Post] /adminDetails
    adminDetails(req, res, next) {
        res.json( req.admin )
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
    findUserById(req, res, next) {
        User.findOne({_id: req.params.userId})
           .then(user => res.json({ data: user }))
           .catch(next)
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

     // User actions 
    userActions(req, res, next) {
        const { action, userIds } = req.body

        switch (action) {
            case 'delete':
                User.delete({ _id: { $in: userIds } })
                   .then(() => res.json({ data: {msg: 'Đã chuyển user vào mục bị ban'} }))
                   .catch(next)
                break
            case 'forceDelete':
                User.deleteMany({ _id: { $in: userIds } })
                   .then(() => res.json({ data: {msg: 'Đã xóa user thành công'} }))
                   .catch(next)
                break
            case'restore':
                User.restore({ _id: { $in: userIds } })
                   .then(() => res.json({ data: {msg: 'Khôi phục user thành công'} }))
                   .catch(next)
                break
            default:
                return res.json({ data: {msg: 'Hành động k hợp lệ '} })
        }
    }
    // Room ----------------------------------------------------------------
    // [Get] /admin/room
    async Room(req, res, next) {
        try {
            const roomList = await Room.countDocuments({})
            console.log(roomList)
            const roomTrash = await Room.countDocumentsWithDeleted({ deleted: true })
    
            res.status(200).json({ data: {roomList, roomTrash} })
        } catch (error) {
            res.status(500).json({ data: {msg: 'lỗi truy xuất dữ liệu Room'} })
        }
    }
    findRoomById(req, res, next) {
        Room.findOne({_id: req.params.roomId})
           .then(room => res.json({ data: room }))
           .catch(next)
    }
    // [Get] /admin/statisticsRoom  StatisticsRoom-------------------------------------------------
    async statisticsRoom(req, res, next) {
        try {
            const singleBed = await Room.countDocuments({ bedType: 'Gường đơn' })
            const doubleBed = await Room.countDocuments({ bedType: 'Gường đôi' })
            const oneBed = await Room.countDocuments({ bedCount: '1' })
            const twoBeds = await Room.countDocuments({ bedCount: '2' })

            const twoPeople = await Room.countDocuments({ capacity: '2' })
            const fourPeople = await Room.countDocuments({ capacity: '4' })

            const fiveStars = await Room.countDocuments({ rating: '5' })

    
            res.status(200).json({
                data: {
                    singleBed,
                    doubleBed,
                    oneBed,
                    twoBeds,
                    twoPeople,
                    fourPeople,
                    fiveStars,
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
        console.log('anh:', req.file)
        const file = req.file

        res.json({ data: file })

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

    // Room actions 
    roomActions(req, res, next) {
        const { action, roomIds } = req.body

        switch (action) {
            case 'delete':
                Room.delete({ _id: { $in: roomIds } })
                   .then(() => res.json({ data: {msg: 'Đã chuyển phòng vào thùng rác'} }))
                   .catch(next)
                break
            case 'forceDelete':
                Room.deleteMany({ _id: { $in: roomIds } })
                   .then(() => res.json({ data: {msg: 'Đã xóa phòng thành công'} }))
                   .catch(next)
                break
            case'restore':
                Room.restore({ _id: { $in: roomIds } })
                   .then(() => res.json({ data: {msg: 'Khôi phục phòng thành công'} }))
                   .catch(next)
                break
            default:
                return res.json({ data: {msg: 'Hành động k hợp lệ '} })
        }
    }
    // Booking management ----------------------------------------------

    // [GET] admin/booked-deposit
    async bookedList(req, res, next) {
        const {status} = req.body
        if(!status) {
            const bookings = await Booking.find({})
            return res.json({ data: {msg: 'Danh sách booking ', bookings } })
        }
        const bookings  = await Booking.find({status: status})
        res.json({ data: {msg: 'Danh sách booking ', bookings } })
    }
    async bookedCancel(req, res, next) {
        const {id} = req.body
        const booking = await Booking.findOne({bookingId: id})
        if(booking){
            booking.status = 'Hủy đặt'
            await booking.save()
            const user = await User.findById(booking.userId)
            const bookedRooms = user?.bookedRooms?.filter(booked => booked?.bookingId !== id)
            user.bookedRooms = bookedRooms
            await user.save()
        }
        const roomId = booking?.roomId
        if (roomId && roomId.length > 0) {
            await Promise.all(
                roomId.map(async (roomId) => {
                    const room = await Room.findById(roomId)
                    if (room) {
                        room.bookedUsers = room.bookedUsers?.filter((booked) => booked.bookingId !== id)
                        await room.save()
                    }
                })
            )
        }

        res.json({ data: {status:200 , msg: 'Hủy phòng thành công ' } })
    }
    // [GET] admin/booking-trash
    async bookingTrash(req, res, next) {
        const bookings  = await Booking.findWithDeleted({deleted: true})
        res.json({ data: {msg: 'Những giao dịch đã bị xóa', bookings } })
    }
    
    //aaa
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

    // Booking actions 
    bookingActions(req, res, next) {
        const { action, bookingIds } = req.body

        switch (action) {
            case 'delete':
                Booking.deleteOne({ _id: { $in: bookingIds } })
                   .then(() => res.json({ data: {msg: 'Đã chuyển giao dịch vào thùng rác'} }))
                   .catch(next)
                break
            case 'forceDelete':
                Booking.deleteMany({ _id: { $in: bookingIds } })
                   .then(() => res.json({ data: {msg: 'Đã xóa giao dịch thành công'} }))
                   .catch(next)
                break
            case'restore':
                Booking.restore({ _id: { $in: bookingIds } })
                   .then(() => res.json({ data: {msg: 'Khôi phục giao dịch thành công'} }))
                   .catch(next)
                break
            default:
                return res.json({ data: {msg: 'Hành động k hợp lệ '} })
        }
    }

    // Booking payment 
    async paymentBooking(req, res, next) {
        const { bookingId, paymentMethod } = req.body
        if(paymentMethod === 'cash') {
            const booking = await Booking.findOne({bookingId: bookingId})
            booking.status = 'Đã thanh toán'
            booking.outstandingBalance = 0;
            await booking.save()

            res.status(200).json({ data: {status: 200, msg: 'Thanh toán bằng tiền mặt thành công', booking} })

        } else if(paymentMethod === 'account') {
            const booking = await Booking.findOne({bookingId: bookingId})
            const { userId, outstandingBalance } = booking
            const user = await User.findOne({_id: userId})
            let newAccountBalance
            newAccountBalance = user.accountBalance - outstandingBalance
            if(newAccountBalance < 0) {
                return res.json({ data: {status: 400, insufficientBalance: true, msg: 'Số sư tài khoản không đủ để thanh toán' } })
            }
            user.accountBalance = newAccountBalance
            await user.save()
            booking.status = 'Đã thanh toán'
            booking.outstandingBalance = 0
            await booking.save()
            res.json({ data: {status: 200, msg: 'Thanh toán bằng tài khoản coneko thành công' } })
        }
    }
    
    
}

module.exports = new AdminController