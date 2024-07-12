const User = require('../models/User')


class UsersController {

    // [Get] / users
    index(req, res, next) {
        User.find({})
            .then(users => res.json(users))
            .catch(next)
    }
    show(req, res) {
        res.send('showw')
    }
}

module.exports = new UsersController