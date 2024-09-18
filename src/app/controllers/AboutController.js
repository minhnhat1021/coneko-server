const User = require('../models/User')


class AboutController {

    // [Get] / about
    about(req, res, next) {
        const userData = req.user
        res.json({msg: 'truy cập vào about thành công',  userData})
    }
    
}

module.exports = new AboutController