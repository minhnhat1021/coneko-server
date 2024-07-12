const mongoose = require('mongoose')

const Schema = mongoose.Schema

const User = new Schema({
    email: {type: String, default: ''},
    username: {type: String, default: ''},
    password: {type: String, default: ''},
    displayName: {type: String, default: ''},
    avatar: {type: String, default: ''},
    role: {type: String, default: ''},
    isActive: {type: String, default: ''},
    verifyToken: {type: String, default: ''},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: ''},

})

module.exports = mongoose.model('User', User)