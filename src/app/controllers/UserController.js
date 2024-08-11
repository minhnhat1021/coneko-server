const User = require('../models/User')


class UserController {


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
    mybooking(req, res, next) {
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
                    res.status(200).json({ message: 'Đã tìm thấy tài khoản', user })
                }else {
                    res.json({msg: 'Không tìm thấy tài khoản này'})
                }
            })    
    }
}

module.exports = new UserController