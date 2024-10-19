const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/coneko_hotel_dev', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('kết nối đến database thành công')
    } catch (err) {
        console.log('kết nối đến database thất bại')

    }
}
module.exports = { connect }