const Room = require('../models/Room')
const User = require('../models/User')
const VnPayTransaction = require('../models/VnPayTransaction')

var querystring = require('qs')
const crypto = require('crypto')
const CryptoJS = require('crypto-js')

const axios = require('axios').default

const moment = require('moment')
const { v1: uuidv1 } = require('uuid')
const paypal = require('paypal-rest-sdk')
const { errorMonitor } = require('events')


const cron = require('node-cron')
// Cấu hình SDK với thông tin từ PayPal Developer
paypal.configure({
    'mode': 'sandbox', // Hoặc 'live' nếu là môi trường thực
    'client_id': 'AR2QfHBja3liPa_Zb9sJkXudCPKwol1aDbsjYUv9z8XbBI-qypxcnGlxaJSTkyhG8guSTvY7y3t_6Zgb',
    'client_secret': 'ECjuH6I43Pg-RjEKcIPj0kbLMr6qsE1joJQvrGsWdNmPrk56g4NiVs1BNK-E9Q8stVaBHlqdEqEmuAwa'
})


cron.schedule('0 0 * * *', async () => {
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
        await user.save();
    }

    console.log("đã update currentRooms cho tất cả user");
})

class RoomsController {


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
                "return_url": `http://localhost:3000/payment-verification?payPalDetails=${paymentDetails}`,  // URL khi thanh toán thành công
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

    async confirmPayPalCheckout (req, res, next) {
        try {
            const { paymentId, payerId } = req.body
    
            if (!paymentId || !payerId) {
                return res.status(400).json({ error: 'Thiếu thông tin paymentId hoặc payerId' })
            }
    
            // Gọi PayPal API để xác nhận thanh toán
            paypal.payment.execute(paymentId, { "payer_id": payerId }, async function (error, payment) {
                if (error) {
                    console.error('Lỗi xác nhận PayPal:', error.response ? error.response : error)
                    return res.status(500).json({ error: 'Lỗi xác nhận thanh toán PayPal' })
                } else {
                    try {
                        // Kiểm tra trạng thái thanh toán
                        if (payment.state === 'approved') {
                            return res.json({ data: { message: 'Thanh toán PayPal thành công', payment } })
                        } else {
                            return res.status(400).json({ data: { error: 'Thanh toán PayPal chưa hoàn tất' } })
                        }
                    } catch (err) {
                        console.error('Lỗi khi lưu thông tin người dùng hoặc phòng:', err);
                        return res.status(500).json({ data: { err: 'Lỗi khi lưu thông tin vào cơ sở dữ liệu' } })
                    }
                }
            })
    
        } catch (err) {
            console.error('Lỗi trong quá trình xác nhận thanh toán:', err)
            next(err)
        }
    }
    async savePayPalCheckout (req,res, next) {
        try {
            const { 
                startDate, endDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities,  totalPrice, roomId, userId, paymentId, payerId
            } = req.body.payPalDetails
            
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
            
            res.json({ data: {message:'Lưu dữ liệu thanh toán phòng bằng payPay thành công', return_code: 1} })

        } catch (err) {

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
            let vnpUrl = process.env.VNPAY_ENDPOINT

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
            vnp_Params['vnp_ReturnUrl'] = `http://localhost:3000/payment-verification?vnPayCheckoutId=${vnPayCheckoutId}`
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
        let { vnp_Params } = req.body

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
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
            res.json({ data: {message: 'Xác nhận thanh toán vnPay thành công', code: vnp_Params['vnp_ResponseCode']} })
        } else{
            res.json({ data: {message: 'Thanh toán vnPay không thành công', code: '97'} })
        }
    }
    
    async saveVnPayCheckout (req, res, next) {
        try{    
            const { vnPayCheckoutId } = req.body
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
                amenitiesCharge, amenities, amountSpent, bookingDate
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
                checkInDate,
                checkOutDate,
            })
            await room.save()

            const vnPayDetails = {startDate: checkInDate, endDate: checkOutDate, days, roomPrice, roomCharge, amenitiesPrice, 
            amenitiesCharge, amenities, totalPrice: amountSpent, roomId, userId}

            res.json({ data: {message:'Lưu dữ liệu thanh toán phòng bằng vnPay thành công', vnPayDetails } })

        } catch(err) {
            next(err)
        }
            
    }

    // vnPay check out -------------------------------------------------------------------
    async zaloPayCheckout(req, res, next) {
        let { 
            startDate, endDate, days, roomPrice, roomCharge, amenitiesPrice, 
            amenitiesCharge, amenities,  totalPrice, roomId, userId 
        } = req.body

        const paymentDetails = encodeURIComponent(JSON.stringify(req.body))
        // APP INFO
        const config = {
            app_id: process.env.ZALOPAY_APP_ID,
            key1: process.env.ZALOPAY_KEY_1,
            key2: process.env.ZALOPAY_KEY_2,
            endpoint: process.env.ZALOPAY_ENDPOINT,
        }

        const embed_data = {
            redirecturl: `http://localhost:3000/payment-verification?zalopayDetails=${paymentDetails}`,
        }
        const items = [{}]
        const transID = Math.floor(Math.random() * 1000000);
        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`, 
            app_user: "user123",
            app_time: Date.now(), 
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: totalPrice,
            description: `Thanh toán đặt phòng #${transID}`,
            bank_code: "",
            callback_url: 'https://c8fa-2402-800-61ed-ab3e-2009-85a9-e669-e3f8.ngrok-free.app/api/room/checkout/zalopay/confirm'
            
        }

        // appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString()

        try {
            const zalopayRes = await axios.post(config.endpoint, null, { params: order })
            if (zalopayRes.data && zalopayRes.data.order_url) {
                return res.status(200).json({ data: { zlpUrl: zalopayRes.data.order_url }});
            } else {
                return res.status(400).json({ message: "Không thể tạo đơn thanh toán ZaloPay" })
            }
        } catch (error) {
            console.error(error)
            return res.status(500).json({ message: "Lỗi kết nối ZaloPay" })
        }
    }

    async confirmZaloPayCheckout(req, res, next) {
        const config = {
            key2: process.env.ZALOPAY_KEY_2
        }

        let result = {}

        try {
            let dataStr = req.body.data
            let reqMac = req.body.mac

            let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString()
            console.log("mac =", mac)


            // kiểm tra callback hợp lệ (đến từ ZaloPay server)
            if (reqMac !== mac) {
                // callback không hợp lệ
                result.return_code = -1
                result.return_message = "mac không hợp lệ"
            }
            else {
                // thanh toán thành công
                // merchant cập nhật trạng thái cho đơn hàng
                let dataJson = JSON.parse(dataStr, config.key2);
                console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"])

                result.return_code = 1
                result.return_message = "success"
                
            }
        } catch (ex) {
            result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
            result.return_message = ex.message
        }
        res.json(result)
    }
    async statusZaloPayCheckout(req, res, next) {
        const apptransid = req.params.apptransid

        const config = {
            app_id: process.env.ZALOPAY_APP_ID,
            key1: process.env.ZALOPAY_KEY_1,
            key2: process.env.ZALOPAY_KEY_2,
            endpoint: "https://sb-openapi.zalopay.vn/v2/query"
        }

        let postData = {
            app_id: config.app_id,
            app_trans_id: apptransid, 
        }

        let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1
        postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString()

        let postConfig = {
            method: 'post',
            url: config.endpoint,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: querystring.stringify(postData)
        }

        try{
            const result = await axios(postConfig)
            res.json({data: result.data})
        } catch(err){
            console.log(err)
        }
            
    }

    async saveZaloPayCheckout (req, res, next) {
        try{    
            const { zaloPayDetails } = req.body
            
            const { startDate, endDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities, totalPrice, roomId, userId  } = zaloPayDetails

            // Handle model User ----------------------------------------------------------------
            const user = await User.findById(userId)
            if (!user) {
                return res.status(404).json({ msg: 'User đang thanh toán không khả dụng' })
            }
            
            user.totalSpent += totalPrice

            const bookingDate = Date.now()
            
            // Thêm giao dịch vào lịch sử phòng đã đặt
            user.bookedRooms.push({
                roomId, checkInDate: startDate, checkOutDate: endDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities, amountSpent: totalPrice, bookingDate
            })

            // Cập nhật phòng mà khách hàng đang có quyền sử dụng
            user.currentRooms.push({
                roomId, checkInDate: startDate, checkOutDate: endDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities, amountSpent: totalPrice, bookingDate
            })
            console.log('booked:', {roomId, checkInDate: startDate, checkOutDate: endDate, days, roomPrice, roomCharge, amenitiesPrice, 
                amenitiesCharge, amenities, amountSpent: totalPrice, bookingDate})
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

            res.json({ data: {message:'Lưu dữ liệu thanh toán phòng bằng zaloPay thành công', return_code: 1} })

        } catch(err) {
            next(err)
        }
            
    }
}

module.exports = new RoomsController
