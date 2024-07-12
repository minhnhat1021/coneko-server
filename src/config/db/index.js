const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/coneko_hotel_dev', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('kết nối thành công')
    } catch (err) {
        console.log('kết nối thất bại')

    }
}
module.exports = { connect }