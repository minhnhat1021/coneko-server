const User = require('../models/User')


class UserController {


    userDetail(req, res, next) {
        User.findOne({fullName: req.params.name})
            .then(user => res.json(user))
    }
    // [Get] /user/account
    show(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/account
    account(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/account
    purchase(req, res, next) {
        res.json(req.user)
    }

    // [Get] /user/account
    bookingHistory(req, res, next) {
        res.json(req.user)
    }
    paycard(req, res, next) {
        res.json(req.user)
    }
    // [Get] /user/search
    findUser(req, res) {
        const {q} = req.query
        User.findOne({userName: req.query.q}) 
            .then((user) => {

                if(user) {
                    res.status(200).json({ msg: 'Đã tìm thấy tài khoản', user })
                }else {
                    res.json({msg: 'Không tìm thấy tài khoản này'})
                }
            })    
    }
}

module.exports = new UserController