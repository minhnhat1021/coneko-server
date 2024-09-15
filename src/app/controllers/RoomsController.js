const Room = require('../models/Room')


class RoomsController {

    // [Get] /Rooms/

    showRooms(req, res) {
        
        Room.find({ }) 
        .then(rooms => res.json(rooms))          
    }

    // [Get] /Rooms/search/:nam
 
    searchRooms(req, res) {
        
        const {q} = req.query

        Room.find({ name: { $regex: q, $options: 'i' } }) 
        .then((data) => {

            if(data.length === 0) {
                res.json({msg: 'Không tìm thấy room nào', data : []})
            }else {
                res.status(200).json({ meg: 'Đã tìm thấy room', data })
            }
        })    
    }
}

module.exports = new RoomsController