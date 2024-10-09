// sau khi kết nối đến db, mongoose sẽ nhận về dữ liệu bên phía db (ở đây đang kết nối tới db bảng Admin)
const mongoose = require('mongoose')  

// Schema để db có tính liên kết chặt chẽ hơn
const Schema = mongoose.Schema

const mongooseDelete = require('mongoose-delete')

// nạp dữ liệu db bảng user vào biến Admin 
const Admin = new Schema({
    userName: {type: String, default: ''},
    password: {type: String, default: ''},
    fullName: {type: String, default: ''},
    isActive: {type: Boolean, default: true},
    verifyToken: {type: String, default: ''},
}, {
    timestamps: true // tạo dữ liệu về thời gian tạo và xóa Admin
})

// add plugin
Admin.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all', 
})

module.exports = mongoose.model('Admin', Admin)