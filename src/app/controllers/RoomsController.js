const Room = require('../models/Room')


class RoomsController {

    // [Get] /Rooms/

    showRooms(req, res, next) {
        
        Room.find({}) 
            .then(rooms => 
                res.json({ data: { rooms } })
            )    
            .catch(err => next(err))      
    }

    // [Get] /Rooms/search/:nam
 
    searchRooms(req, res, next) {
        
        const {q} = req.query

        Room.find({ name: { $regex: q, $options: 'i' } }) 
            .then((data) => {

                if(data.length === 0) {
                    res.json({msg: 'Không tìm thấy room nào', data : []})
                }else {
                    res.status(200).json({ msg: 'Đã tìm thấy room', data })
                }
            })    
            .catch(err => next(err))      

    }
}

module.exports = new RoomsController