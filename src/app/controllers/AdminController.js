const Room = require('../models/Room')


class AdminController {


    // [Get] /admin/create-room
    showRoom(req, res, next) {
        Room.find({})
           .then(rooms => res.json(rooms))
           .catch(next)
    }
    
    // [POST] /admin/create-room
    createRoom(req, res, next) {
        const newRoom = new Room(req.body)

        newRoom.save()
            .then(() => res.json(req.body))
            .then(() => res.json({message: 'Thêm phòng thành công'}))
            .catch(next)

    }

    
}

module.exports = new AdminController