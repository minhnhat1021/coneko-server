const User = require('../models/User')

class RegisterController {

    // [POST]
    create(req, res) {

        const userRegister = new User(req.body)
        userRegister.save()

        res.json(req.body)
        // res.redirect('back')
    }
}

module.exports = new RegisterController