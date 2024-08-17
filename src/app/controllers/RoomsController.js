const Room = require('../models/Room')


class RoomsController {

    // [Get] /Rooms/

    showRooms(req, res) {
        
        Room.find({ }) 
        .then(rooms => res.json(rooms))          
    }
}

module.exports = new RoomsController