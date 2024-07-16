const User = require('../models/User')


class AboutController {

    // [Get] / about
    about(req, res, next) {
        const userDataToken = req.user
        res.json({message: 'truy cập vào about thành công', data: userDataToken})
    }
    
}

module.exports = new AboutController