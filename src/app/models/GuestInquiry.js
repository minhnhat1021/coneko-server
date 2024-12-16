// sau khi kết nối đến db, mongoose sẽ nhận về dữ liệu bên phía db (ở đây đang kết nối tới db bảng Booking)
const mongoose = require('mongoose')  

// Schema để db có tính liên kết chặt chẽ hơn
const Schema = mongoose.Schema

const mongooseDelete = require('mongoose-delete')


// nạp dữ liệu db bảng Booking vào biến Booking 
const GuestInquiry = new Schema({
    fullName: {type: String},
    phone: {type: String},
    email: {type: String},
    address: {type: String},
    numberOfPeople: {type: String},
    preferences: {type: String}
}, {
    timestamps: true // tạo dữ liệu về thời gian tạo và xóa User
})

// add plugin
GuestInquiry.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all', 
})

module.exports = mongoose.model('GuestInquiry', GuestInquiry)