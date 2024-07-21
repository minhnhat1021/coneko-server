const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    status: { type: String, enum: ['available', 'booked', 'unavailable'], default: 'available' },
    roomSize: { type: Number, default: 40 }, 
    view: { type: String, default: '' } // Loại view (ví dụ: sea view, city view)

}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Room', Room);