const Room = require('../models/Room')
const User = require('../models/User')
const Booking = require('../models/Booking')
const VnPayTransaction = require('../models/VnPayTransaction')

const axios = require('axios').default

var querystring = require('qs')
const crypto = require('crypto')
const CryptoJS = require('crypto-js')
const moment = require('moment')
const QRCode = require('qrcode')

const paypal = require('paypal-rest-sdk')

const cron = require('node-cron')

// Cấu hình SDK với thông tin từ PayPal Developer
paypal.configure({
    'mode': 'sandbox', 
    'client_id': 'AR2QfHBja3liPa_Zb9sJkXudCPKwol1aDbsjYUv9z8XbBI-qypxcnGlxaJSTkyhG8guSTvY7y3t_6Zgb',
    'client_secret': 'ECjuH6I43Pg-RjEKcIPj0kbLMr6qsE1joJQvrGsWdNmPrk56g4NiVs1BNK-E9Q8stVaBHlqdEqEmuAwa'
})

cron.schedule('01 10 * * *', async () => {
    const users = await User.find()

    const currentTime = new Date()
    
    for (const user of users) {
        // Lọc currentRooms từ bookedRooms
        const currentRooms = user.bookedRooms.filter(booking => {
            return booking.checkOutDate >= currentTime
        })

        // Cập nhật currentRooms
        user.currentRooms = currentRooms

        // Lưu lại thông tin của user
        await user.save()
    }

    console.log("đã update currentRooms cho tất cả user")
})
const handleLevel = (totalSpent) => {
    if (totalSpent >= 100000000) {
        return 'vip'
    } else if (totalSpent >= 80000000) {
        return 'diamond'
    } else if (totalSpent >= 50000000) {
        return 'platinum'
    } else if (totalSpent >= 30000000) {
        return 'gold'
    } else if (totalSpent >= 20000000) {
        return 'silver'
    }
    return 'normal'
}
async function handleCheckout(details, res, next) {
    
    try{
        const { 
            startDate, endDate, days, roomPrice, roomCharge, amenitiesPrice, amenitiesCharge, amenities, 
            originalPrice, discountRate, discountAmount,  totalPrice, roomId, userId 
        } = details

        // Kiểm tra user
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ msg: 'User đang thanh toán không khả dụng' })
        }

        // Kiểm tra số dư
        const newAccountBalance = user.accountBalance - totalPrice
        if (newAccountBalance < 0) {
            return res.json({ data: {insufficientBalance: true, msg: 'Số sư tài khoản không hợp lệ' } })
        }

        user.accountBalance = newAccountBalance

        
        user.totalSpent += totalPrice

        user.level = await handleLevel(user.totalSpent)

        const bookingDate = Date.now()
        
        const newBooking = {
            userId,
            roomId, 
            checkInDate: startDate, 
            checkOutDate: endDate, 
            days,
            roomPrice, 
            roomCharge, 
            amenitiesPrice, 
            amenitiesCharge, 
            amenities, 
            originalPrice, 
            discountRate, 
            discountAmount,
            amountSpent: totalPrice,
            bookingDate
        }

        // Handle model Room ----------------------------------------------------------------
        const room = await Room.findById(roomId)

        // Thêm giao dịch vào lịch sử phòng đã đặt
        room.bookedUsers.push({
            userId
        })
        room.currentUsers.push({
            userId,
            checkInDate: startDate,
            checkOutDate: endDate,
        })
        // Lưu dữ liệu vào trong data booking
        const bookingDetails = await Booking.create({...newBooking, user, room})

        // Thông tin cần được mã hóa vào mã QR
        const qrData = `http://localhost:3000/admin/booking-management/details/${bookingDetails._id}`

        // Tạo mã QR
        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData))

        newBooking.qrCode = qrCode
        
        // Thêm giao dịch vào lịch sử phòng đã đặt
        user.bookedRooms.push(newBooking)
        user.currentRooms.push(newBooking)

        bookingDetails.qrCode = qrCode

        await user.save()
        await room.save()
        await bookingDetails.save()
        res.json({ data: { msg: 'Thanh toán thành công', newAccountBalance, room, qrCode } })

    } catch(err) {
        next(err)
    }
        
    
}
class RoomsController {
    

}

module.exports = new RoomsController
