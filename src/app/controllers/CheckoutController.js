const Room = require('../models/Room')
const User = require('../models/User')
const VnPayTransaction = require('../models/VnPayTransaction')

var querystring = require('qs')
const crypto = require('crypto')

const moment = require('moment')

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


    // vnPay check out -------------------------------------------------------------------
    async vnPayCheckout(req, res, next) {
        try{
        
            let { 
                startDate, endDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities,  totalPrice, roomId, userId 
            } = req.body

            function sortObject(obj) {
                let sorted = {}
                let str = []
                let key
                for (key in obj){
                    if (obj.hasOwnProperty(key)) {
                    str.push(encodeURIComponent(key))
                    }
                }
                str.sort()
                for (key = 0; key < str.length; key++) {
                    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+")
                }
                return sorted
            }

            let orderId = moment(new Date()).format('DDHHmmss')
            let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'

            const bookingDate = Date.now()
            const vnPayPayment = new VnPayTransaction({orderId, userId, roomId, checkInDate: startDate, checkOutDate: endDate, days,
                roomPrice, roomCharge, amenitiesPrice, amenitiesCharge, amenities, amountSpent: totalPrice, bookingDate})
                                
            await vnPayPayment.save()
            const vnPayCheckoutId = vnPayPayment._id

            let vnp_Params = {}
            vnp_Params['vnp_Version'] = '2.1.0'
            vnp_Params['vnp_Command'] = 'pay'
            vnp_Params['vnp_TmnCode'] = process.env.VNPAY_TMN_CODE
            vnp_Params['vnp_Locale'] = 'vn'
            vnp_Params['vnp_CurrCode'] = 'VND'
            vnp_Params['vnp_TxnRef'] = orderId
            vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId
            vnp_Params['vnp_OrderType'] = 'other'
            vnp_Params['vnp_Amount'] = totalPrice * 100
            vnp_Params['vnp_ReturnUrl'] = `http://localhost:3000/payment-successful?vnPayCheckoutId=${vnPayCheckoutId}`
            vnp_Params['vnp_IpAddr'] = '127.0.0.1'
            vnp_Params['vnp_CreateDate'] = moment(new Date()).format('YYYYMMDDHHmmss')
            vnp_Params['vnp_BankCode'] = 'NCB'


            vnp_Params = sortObject(vnp_Params)

            let signData = querystring.stringify(vnp_Params, { encode: false })
            let hmac = crypto.createHmac("sha512", process.env.VNPAY_SECRET)
            let signed = hmac.update(signData).digest("hex")
            
            vnp_Params['vnp_SecureHash'] = signed

            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false })

            res.json({ data: { vnpUrl } })   

        } catch(err) {
            next(err)
        }
        
    }

    async confirmVnPayCheckout (req, res, next) {
        try {

            let { vnPayCheckoutId, vnp_Params} = req.body

            const paymentDetails = await VnPayTransaction.findById(vnPayCheckoutId)

            if(!paymentDetails) {
                return res.status(404).json( { data:{ msg: 'Thanh toán không tồn tại' } })
            }

            const {userId, roomId, checkInDate, checkOutDate, days, roomPrice, roomCharge, amenitiesPrice,
                amenitiesCharge, amenities, amountSpent, bookingDate} = paymentDetails

            // Handle model User ----------------------------------------------------------------
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ msg: 'User đang thanh toán không khả dụng' })
            }

            user.totalSpent += amountSpent

            // Thêm giao dịch vào lịch sử phòng đã đặt
            user.bookedRooms.push({
                roomId, checkInDate, checkOutDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities, amountSpent, bookingDate
            })

            // Cập nhật phòng mà khách hàng đang có quyền sử dụng
            user.currentRooms.push({
                roomId, checkInDate, checkOutDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities, amountSpent,bookingDate
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
                checkInDate,
                checkOutDate,
            })


            // Xử lý so sánh chữ ký VnPay, nếu đúng thì mới lưu thông tin phòng --------------------------
            let secureHash = vnp_Params['vnp_SecureHash']
        
            delete vnp_Params['vnp_SecureHash']
            delete vnp_Params['vnPayCheckoutId']
        
            function sortObject(obj) {
                let sorted = {}
                let str = []
                let key
                for (key in obj){
                    if (obj.hasOwnProperty(key)) {
                    str.push(encodeURIComponent(key))
                    }
                }
                str.sort()
                for (key = 0; key < str.length; key++) {
                    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+")
                }
                return sorted
            }
            vnp_Params = sortObject(vnp_Params)
        
            let signData = querystring.stringify(vnp_Params, { encode: false })
            let hmac = crypto.createHmac("sha512", process.env.VNPAY_SECRET)
            let signed = hmac.update(signData).digest("hex") 
        
            if(secureHash === signed){
                
                await Promise.all([user.save(), room.save()])
                return res.json({ data: { message: 'Thanh toán VnPay và lưu dữ liệu đặt phòng thành công', paymentDetails } })

            } else{
                return res.status(400).json({data: { msg: 'Chữ ký vnPay không đúng' } })
            }

        } catch (err) {
            next(err)
        }
    }
    async vnPayCheckoutDetails (req, res, next) {
        try {

            let { vnPayCheckoutId, vnp_Params} = req.body

            const paymentDetails = await VnPayTransaction.findById(vnPayCheckoutId)

            if(!paymentDetails) {
                return res.status(404).json( { data:{ msg: 'Thanh toán không tồn tại' } })
            }

            const {userId, roomId, checkInDate, checkOutDate, days, roomPrice, roomCharge, amenitiesPrice,
                amenitiesCharge, amenities, amountSpent, bookingDate} = paymentDetails

            return res.json({ data: { message: 'Dữ liệu chi tiết khi đặt phòng thanh toán qua vnPay', paymentDetails } })

        } catch (err) {
            next(err)
        }
    }
}

module.exports = new RoomsController
