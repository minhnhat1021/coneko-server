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
            const {startDate, endDate, days, totalPrice, roomId, userId} = req.body

            // Kiểm tra user
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ message: 'User đang thanh toán không khả dụng' })
            }

            // Kiểm tra số dư
            const newAccountBalance = user.accountBalance - totalPrice
            if (newAccountBalance < 0) {
                return res.status(400).json({ data: { message: 'Số sư tài khoản không hợp lệ' } })
            }

            user.accountBalance = newAccountBalance
            user.totalSpent += totalPrice

            // Thêm giao dịch vào lịch sử phòng đã đặt
            user.bookedRooms.push({
                roomId,
                amountSpent: totalPrice
            })

            // Cập nhật phòng đang có quyền sử dụng
            user.currentRooms.push({
                roomId,
                checkInDate: startDate,
                checkOutDate: endDate,
                amountSpent: totalPrice
            })
            await user.save()
            res.json({ data: { message: 'Thanh toán thành công', newAccountBalance } })

        } catch(err) {
            next(err)
        }
        
    }
}

module.exports = new RoomsController