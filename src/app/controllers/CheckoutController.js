const Room = require('../models/Room')
const User = require('../models/User')

const paypal = require('paypal-rest-sdk')

// Cấu hình SDK với thông tin từ PayPal Developer
paypal.configure({
    'mode': 'sandbox', // Hoặc 'live' nếu là môi trường thực
    'client_id': 'AR2QfHBja3liPa_Zb9sJkXudCPKwol1aDbsjYUv9z8XbBI-qypxcnGlxaJSTkyhG8guSTvY7y3t_6Zgb',
    'client_secret': 'ECjuH6I43Pg-RjEKcIPj0kbLMr6qsE1joJQvrGsWdNmPrk56g4NiVs1BNK-E9Q8stVaBHlqdEqEmuAwa'
})

class RoomsController {

    // Coneko check out -------------------------------------------------------------------
    async conekoCheckout(req, res, next) {
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

    // Paypal check out -------------------------------------------------------------------
    payPalCheckout(req, res, next) {
        let { 
            startDate, endDate, days, roomPrice, roomCharge, amenitiesPrice, 
            amenitiesCharge, amenities,  totalPrice, roomId, userId 
        } = req.body

        const paymentDetails = encodeURIComponent(JSON.stringify(req.body))
        // Cấu hình yêu cầu thanh toán
        const exchangeRate = 24605
        const amountInUSD = (totalPrice / exchangeRate).toFixed(2)
        
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": amountInUSD.toString()
                },
                "description": `Thanh toán bằng payPal`
            }],
            "redirect_urls": {
                "return_url": `http://localhost:3000/payment-successful?paymentDetails=${paymentDetails}`,  // URL khi thanh toán thành công
                "cancel_url": "http://localhost:3000/payment-cancel"    // URL khi thanh toán bị hủy
            }
        }
    
        // Gọi PayPal API để tạo giao dịch
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error(error)
                res.status(500).json({ error: 'Error creating PayPal payment' })
            } else {

                // Trả về URL để khách hàng thực hiện thanh toán trên PayPal
                for (let i = 0 ; i < payment.links.length ; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.json({ data: { paymentUrl: payment.links[i].href } })
                        break
                    }
                }
            }
        })
    }


    // confirm Paypal check out -------------------------------------------------------------------

    async confirmPayPalCheckout (req, res, next) {

        try{
            const { 
                startDate, endDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities,  totalPrice, roomId, userId, paymentId, payerId
            } = req.body
            
            // Lưu thông tin đặt phòng vào user và room
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ msg: 'User đang thanh toán không khả dụng' })
            }

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

            // Gọi PayPal API để xác nhận thanh toán ----------------------------------------------------------------
            const exchangeRate = 24605
            const amountInUSD = (totalPrice / exchangeRate).toFixed(2)

            const execute_payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": amountInUSD.toString() 
                    }
                }]
            }
            
            paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
                if (error) {
                    console.error(error)
                    res.status(500).json({ error: 'Lỗi xác nhận thanh toán payPal' })
                } else {
                    try {
                        await user.save()
                        await room.save()
                        return res.json({ data: { message: 'Thanh toán PayPal thành công', payment } })

                    } catch (saveError) {
                        console.error('Lỗi khi lưu thông tin người dùng hoặc phòng:', saveError)
                        return res.status(500).json({ error: 'Lỗi khi lưu thông tin vào cơ sở dữ liệu' })
                    }
                }
            })
        } catch(err) {
            next(err)
        }
    }
}

module.exports = new RoomsController

