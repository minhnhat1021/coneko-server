const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mongooseDelete = require('mongoose-delete')

const Room = new Schema({
    name: { type: String, default: '' },
    desc: { type: String, default: '' }, 
    overView: { type: String, default: '' }, 
    price: { type: Number, required: true }, 


    bedType: { type: String, enum: ['single', 'double', 'queen', 'king', 'twin', 'bunk'], default: 'single' },
    bedCount: {type: String, default: '2'},
    floor: { type: String, default: '5' }, 
    rating: { type: String, min: 1, max: 5, default: '5' }, 
    amenities: { type: [String], enum:['netflix'], default: ['netflix'] }, 


    images: { type: Object, default: { image1: '', image2: '', image3: '' } },
    smoking: { type: Boolean, default: false }, 
    status: { type: String, enum: ['available', 'booked', 'inUse'], default: 'available' },
    roomSize: { type: Number, default: 40 }, 
    view: { type: String, default: '' } ,

    bookedUsers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
    currentUsers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
})


// add plugin
Room.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all', 
})

module.exports = mongoose.model('Room', Room)