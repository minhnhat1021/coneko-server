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
    
    async filterRoomsByOptions(req, res, next) {
        try {
            const { options } = req.body
            
            let filterCriteria = {}
    
            // Trạng thái phòng
            if (options.includes('available')) {
                filterCriteria.status = 'available'
            } else if (options.includes('booked')) {
                filterCriteria.status = 'booked'
            } else if (options.includes('current')) {
                filterCriteria.status = 'inUse'
            }
            
            // Loại giường
            const bedTypes = []
            if (options.includes('singleBed')) {
                bedTypes.push('single')
            }
            if (options.includes('doubleBed')) {
                bedTypes.push('double')
            }
            if (bedTypes.length > 0) {
                filterCriteria.bedType = { $in: bedTypes }
            }
            const bedCounts = []
            if (options.includes('oneBed')) {
                bedCounts.push('1')
            }
            if (options.includes('twoBed')) {
                bedCounts.push('2')
            }
            if (options.includes('threeBed')) {
                bedCounts.push('3')
            }
            if (bedCounts.length > 0) {
                filterCriteria.bedCount = { $in: bedCounts }
            }
            
            const prices = []
            if (options.includes('standard')) {
                prices.push({ price: { $lte: 4000000 } })
            } 
            if (options.includes('elegance')) {
                prices.push({ price: { $gt: 4000000, $lt: 80000000 } })
            } 
            if (options.includes('skyviewSuite')) {
                prices.push({ price: { $gte: 8000000 } })
            }
            
            if (prices.length === 1) {
                filterCriteria.price = prices[0].price
            } else if(prices.length > 1) {
                filterCriteria = {...filterCriteria, $or: prices}
            }
            
            // Chính sách hút thuốc
            if (options.includes('smoke')) {
                filterCriteria.smoking = true
            } else if (options.includes('noSmoking')) {
                filterCriteria.smoking = false
            }

            const rooms = await Room.find(filterCriteria)
            res.status(200).json({ data: {msg: 'Danh sách phòng sau khi lọc', rooms} })

        } catch (error) {
            res.status(500).json({ data: {msg: 'Lỗi lọc phòng bằng options'} })
        }
        
    }
}

module.exports = new RoomsController