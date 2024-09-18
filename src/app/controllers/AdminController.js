const Room = require('../models/Room')
const User = require('../models/User')

class AdminController {


    // [Get] /admin/user
    async User(req, res, next) {
        try {
            const userList = await User.countDocuments({ })
            const bannedUsers = await User.countDocumentsWithDeleted({ deleted: true })
    
            res.status(200).json({
                data: {
                    userList,
                    bannedUsers
                }  
            })
        } catch (error) {
            res.status(500).json({ message: 'lỗi truy xuất dữ liệu Room' })
        }
    }

    // [Get] /admin/user-list

    userList(req, res, next) {
        User.find({})
           .then(users => res.json(users))
           .catch(next)
    }

    // [Get] /admin/id/user-ban
    userBan(req, res, next) {
        User.delete({ _id: req.body.id})
            .then(() => res.json('Ban user thành công'))
            .catch(next)
    }


    // [Get] /admin/user-ban
    bannedUsers(req, res, next) {
        User.findWithDeleted({ deleted: true})
           .then(rooms => res.json(rooms))
           .catch(next)
    }
    
    restoreUser(req, res, next) {
        User.restore({ _id: req.params.id})
            .then(() => res.json('Khôi phục user thành công'))
            .catch(next)
    }

    forceDeleteUser(req, res, next) {
        User.deleteOne({ _id: req.params.id})
            .then(() => res.json('Xóa vĩnh viễn user thành công'))
            .catch(next)
    }

    // Room ----------------------------------------------------------------
    // [Get] /admin/room
    async Room(req, res, next) {
        try {
            const roomList = await Room.countDocuments({ })
            const roomTrash = await Room.countDocumentsWithDeleted({ deleted: true })
    
            res.status(200).json({
                data: {
                    roomList,
                    roomTrash,
                }  
            })
        } catch (error) {
            res.status(500).json({ msg: 'lỗi truy xuất dữ liệu Room' })
        }
    }

    // [Get] /admin/statisticsRoom
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
    // [Get] /admin/create-room
    showRoom(req, res, next) {
        Room.find({})
           .then(rooms => res.json(rooms))
           .catch(next)
    }
    
    editRoom(req, res, next) {
        Room.findById(req.params.id)
            .then(room => res.json(room))
            .catch(next)
    }
    updateRoom(req, res, next) {
        Room.updateOne({ _id: req.params.id}, req.body)
            .then(() => res.json('Update room thành công'))
            .catch(next)
    }

    // [DELETE soft] /admin/delete-room
    deleteRoom(req, res, next) {
        Room.delete({ _id: req.body.id})
            .then(() => res.json('Delete room thành công'))
            .catch(next)
    }


    // Room Create -----------------------------------------------------------------------------------------

    // [POST] /admin/create-room
    createRoom(req, res, next) {
        const newRoom = new Room(req.body)

        newRoom.save()
            .then(() => res.json(req.body))
            .then(() => res.json({msg: 'Thêm phòng thành công'}))
            .catch(next)
    }

    // [POST] /admin/upload
    uploadRoom(req, res, next) {
        console.log(req.file)

        res.json(req.file)

    }

    // Room Trash -----------------------------------------------------------------------------------------
    
    roomTrash(req, res, next) {
        Room.findWithDeleted({ deleted: true})
           .then(rooms => res.json(rooms))
           .catch(next)
    }

    restoreRoom(req, res, next) {
        Room.restore({ _id: req.params.id})
            .then(() => res.json('Khôi phục room thành công'))
            .catch(next)
    }

    forceDeleteRoom(req, res, next) {
        Room.deleteOne({ _id: req.params.id})
            .then(() => res.json('Xóa vĩnh viễn room thành công'))
            .catch(next)
    }

    


}

module.exports = new AdminController