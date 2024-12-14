// sau khi kết nối đến db, mongoose sẽ nhận về dữ liệu bên phía db (ở đây đang kết nối tới db bảng Booking)
const mongoose = require('mongoose')  

// Schema để db có tính liên kết chặt chẽ hơn
const Schema = mongoose.Schema

const mongooseDelete = require('mongoose-delete')


// nạp dữ liệu db bảng Booking vào biến Booking 
const Booking = new Schema({
    bookingId: {type: String},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomId: {type: Array},

    checkInDate: {type: Date}, 
    checkOutDate: {type: Date}, 
    days: {type: Number},
    bookingDate: { type: Date },

    roomCharge: {type: Number}, 
    discountRate: { type: Number }, 
    discountAmount: { type: Number },
    totalPrice: { type: Number },
    amountSpent: { type: Number },
    outstandingBalance: { type: Number },

    status: {type : String},

    qrCode: { type: String },

    user: { type: Object },
    rooms: { type: Array },

}, {
    timestamps: true // tạo dữ liệu về thời gian tạo và xóa User
})

// add plugin
Booking.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all', 
})

module.exports = mongoose.model('Booking', Booking)