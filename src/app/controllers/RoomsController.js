const User = require('../models/Room')


class RoomsController {

    // [Get] /Rooms/search?q=
    findRoom(req, res) {
        
        const {q} = req.query

        User.find({ name: { $regex: q, $options: 'i' } }) 
        .then((data) => {

            if(data.length === 0) {
                res.json({msg: 'Không tìm thấy phòng này', data : []} )

            }else  {
                res.status(200).json({ message: 'Đã tìm thấy phòng', data })

            }
        })          
    }
}

module.exports = new RoomsController