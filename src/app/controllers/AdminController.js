const Room = require('../models/Room')


class AdminController {


    
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
            res.status(500).json({ message: 'Internal Server Error' })
        }
    }

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

    // [POST] /admin/upload
    uploadRoom(req, res, next) {
        console.log(req.file)

        res.json(req.file)

    }

    
}

module.exports = new AdminController