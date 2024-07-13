// sau khi kết nối đến db, mongoose sẽ nhận về dữ liệu bên phía db (ở đây đang kết nối tới db bảng user)
const mongoose = require('mongoose')  

// Schema để db có tính liên kết chặt chẽ hơn
const Schema = mongoose.Schema


// nạp dữ liệu db bảng user vào biến User 
const User = new Schema({
    email: {type: String, default: ''},
    fullName: {type: String, required: true},
    userName: {type: String, default: ''},
    password: {type: String, default: ''},
    displayName: {type: String, default: ''},
    avatar: {type: String, default: ''},
    role: {type: String, default: ''},
    isActive: {type: String, default: ''},
    verifyToken: {type: String, default: ''},

}, {
    timestamps: true // tạo dữ liệu về thời gian tạo và xóa User
})


module.exports = mongoose.model('User', User)