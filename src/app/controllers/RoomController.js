const Room = require('../models/Room')


class RoomsController {

    // [Get] /Room/

    roomDetail(req, res, next) {
        Room.findOne({name: req.params.name})
            .then(data => res.json({data}) )
            .catch(err => next(err))
    }

    // [Get] /room/:id
    findRoomById(req, res, next) {
        const { roomId } = req.body
        Room.findById(roomId )
            .then(room => res.json({ data: room } ) )
            .catch(err => next(err))
    }

    

}

module.exports = new RoomsController