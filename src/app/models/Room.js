const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mongooseDelete = require('mongoose-delete')

const Room = new Schema({
    name: { type: String, default: '' },
    desc: { type: String, default: '' }, 
    overView: { type: String, default: '' }, 
    price: { type: String, required: true }, 


    bedType: { type: String, enum: ['single', 'double', 'queen', 'king', 'twin', 'bunk'], default: 'single' },
    bedCount: {type: String, default: '1'},
    floor: { type: String, default: '2' }, 
    capacity: { type: String, default: '2' }, 
    rating: { type: String, min: 1, max: 5, default: '5' }, 
    amenities: { type: [String], enum:['netflix'], default: ['netflix'] }, 


    image: { type: String, default: '' },
    smoking: { type: Boolean, default: false }, 
    status: { type: String, enum: ['available', 'booked', 'inUse'], default: 'available' },
    roomSize: { type: Number, default: 40 }, 
    view: { type: String, default: '' } ,

    bookedUsers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            
        }
    ],
    currentUsers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            checkInDate: { type: Date },
            checkOutDate: { type: Date },
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