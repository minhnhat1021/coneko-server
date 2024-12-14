const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mongooseDelete = require('mongoose-delete')

const Room = new Schema({
    name: { type: String, default: '' },
    desc: { type: String, default: '' }, 
    originPrice: { type: Number }, 
    discountPercentage: { type: Number},
    price: { type: Number}, 
    capacity: { type: String, default: '4' },
    size: { type: String, default: '50' },
    bedType: { type: String, enum: ['Giường đơn', 'Giường đôi'], default: 'Giường đôi' },
    bedCount: {type: String, default: '2'},
    rating: { type: String, min: 1, max: 5, default: '5' }, 
    amenities: { type: [String], default: ['Coffee', 'Minabar', 'Bữa sáng'] }, 


    images: { type: Object, default: { image1: '', image2: '', image3: '' } },
    smoking: { type: Boolean, default: false }, 
    status: { type: String, enum: ['Còn trống', 'Đã đặt', 'Đang sử dụng'], default: 'Còn trống' },

    bookedUsers: [
        {
            bookingId: {type: String},
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

            _id: false
        }
    ]

}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
})


// add plugin
Room.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all', 
})

module.exports = mongoose.model('Room', Room)