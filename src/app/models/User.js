// sau khi kết nối đến db, mongoose sẽ nhận về dữ liệu bên phía db (ở đây đang kết nối tới db bảng user)
const mongoose = require('mongoose')  

// Schema để db có tính liên kết chặt chẽ hơn
const Schema = mongoose.Schema

const mongooseDelete = require('mongoose-delete')


// nạp dữ liệu db bảng user vào biến User 
const User = new Schema({
    email: {type: String, default: ''},
    fullName: {type: String, default: ''},
    userName: {type: String, default: ''},
    password: {type: String, default: ''},
    displayName: {type: String, default: ''},
    avatar: {type: String, default: ''},
    accountBalance: {type: Number, default: 100000000},
    totalSpent: {type: Number, default: 0},
    favoriteRooms: [],
    bookedRooms: [
        {
            roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
            checkInDate: {type: Date}, 
            checkOutDate: {type: Date}, 
            days: {type: Number},
            bookingDate: { type: Date },

            roomPrice: {type: Number}, 
            roomCharge: {type: Number}, 
            amenitiesPrice: {type: Number}, 
            amenitiesCharge: {type: Number}, 
            amenities: {type: Object}, 
            originalPrice: { type: Number }, 
            discountRate: { type: Number }, 
            discountAmount: { type: Number },
            amountSpent: { type: Number },

            qrCode: { type: String },
            _id: false
        }
    ],
    currentRooms: [
        {
            roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
            checkInDate: {type: Date}, 
            checkOutDate: {type: Date}, 
            days: {type: Number},
            bookingDate: { type: Date },

            roomPrice: {type: Number}, 
            roomCharge: {type: Number}, 
            amenitiesPrice: {type: Number}, 
            amenitiesCharge: {type: Number}, 
            amenities: {type: Object}, 
            originalPrice: { type: Number }, 
            discountRate: { type: Number }, 
            discountAmount: { type: Number },
            amountSpent: { type: Number },

            qrCode: { type: String },
            _id: false
        }
    ],
    role: {type: String, default: ''},
    level: {type: String, default: 'normal'},
    isActive: {type: Boolean, default: true},
    verifyToken: {type: String, default: ''},
    googleId: {type: String, default: ''},
    avatarGoogleUrl: {type: String, default: ''},
    facebookId: {type: String, default: ''},
    avatarFacebookUrl: {type: String, default: ''},

}, {
    timestamps: true // tạo dữ liệu về thời gian tạo và xóa User
})

// add plugin
User.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all', 
})

module.exports = mongoose.model('User', User)