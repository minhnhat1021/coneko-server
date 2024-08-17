const Room = require('../models/Room')


class RoomsController {

    // [Get] /Rooms/

    roomDetail(req, res, next) {
        Room.findOne({name: req.params.name})
            .then(data => res.json({data}) )
            .catch(err => next(err))
    }
}

module.exports = new RoomsController