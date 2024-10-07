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

    async filterRoomsByOptions(req, res, next) {
        try {
            const { options } = req.body
             console.log(options)
            
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
            if (options.includes('singlebed')) {
                bedTypes.push('single')
            }
            if (options.includes('doublebed')) {
                bedTypes.push('double')
            }
            if (bedTypes.length > 0) {
                filterCriteria.bedType = { $in: bedTypes }
            }
            const bedCounts = []
            if (options.includes('onebed')) {
                bedCounts.push('1')
            }
            if (options.includes('twobed')) {
                bedCounts.push('2')
            }
            if (options.includes('threebed')) {
                bedCounts.push('3')
            }
            if (bedCounts.length > 0) {
                filterCriteria.bedCount = { $in: bedCounts }
            }
            
    
            // Sức chứa phòng
            const capacitys = []
            if (options.includes('oneperson')) {
                capacitys.push('1')
            } if (options.includes('twoperson')) {
                capacitys.push('2')
            } if (options.includes('threeperson')) {
                capacitys.push('3')
            }
            if(capacitys.length > 0){
                filterCriteria.capacity = { $in: capacitys }
            }
            // Chính sách hút thuốc
            if (options.includes('smoke')) {
                filterCriteria.smoking = true
            } else if (options.includes('nosmoking')) {
                filterCriteria.smoking = false
            }

            console.log(filterCriteria)

            // // Tìm kiếm các phòng dựa trên các điều kiện đã xây dựng
            const rooms = await Room.find(filterCriteria)
    
            res.status(200).json({ data: {msg: 'Danh sách phòng sau khi lọc', rooms} })

        } catch (error) {
            res.status(500).json({ data: {msg: 'Lỗi lọc phòng bằng options'} })
        }
        
    }

}

module.exports = new RoomsController