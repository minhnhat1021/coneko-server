const Room = require('../models/Room')
const User = require('../models/User')

class RoomsController {

    // [Get] /Room/

    roomDetail(req, res, next) {
        Room.findOne({name: req.params.name})
            .then(data => res.json({data}) )
            .catch(err => next(err))
    }
    // [Post] /Room/

    async roomPayment(req, res, next) {
        try{
            let { 
                startDate, endDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities,  totalPrice, roomId, userId 
            } = req.body

            // Kiểm tra user
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ msg: 'User đang thanh toán không khả dụng' })
            }

            // Kiểm tra số dư
            const newAccountBalance = user.accountBalance - totalPrice
            if (newAccountBalance < 0) {
                return res.status(400).json({ data: { msg: 'Số sư tài khoản không hợp lệ' } })
            }

            user.accountBalance = newAccountBalance
            user.totalSpent += totalPrice

            const bookingDate = Date.now()
            // Handle model User ----------------------------------------------------------------

            // Thêm giao dịch vào lịch sử phòng đã đặt
            user.bookedRooms.push({
                roomId, checkInDate: startDate, checkOutDate: endDate, days,
                roomPrice, roomCharge, amenitiesPrice, amenitiesCharge, amenities, 
                amountSpent: totalPrice,
                bookingDate

            })

            // Cập nhật phòng mà khách hàng đang có quyền sử dụng
            user.currentRooms.push({
                roomId, checkInDate: startDate, checkOutDate: endDate, days,
                roomPrice, roomCharge, amenitiesPrice, amenitiesCharge, amenities, 
                amountSpent: totalPrice,
                bookingDate
            })
            await user.save()


            // Handle model Room ----------------------------------------------------------------
            const room = await Room.findById(roomId)

            // Thêm giao dịch vào lịch sử phòng đã đặt
            room.bookedUsers.push({
                userId
            })

            // Cập nhật phòng đang có quyền sử dụng
            room.currentUsers.push({
                userId,
                checkInDate: startDate,
                checkOutDate: endDate,
            })
            await room.save()

            res.json({ data: { msg: 'Thanh toán thành công', newAccountBalance, room } })

        } catch(err) {
            next(err)
        }
        
    }
}

module.exports = new RoomsController