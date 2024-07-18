const User = require('../models/User')


class UserController {

    // [Get] /user
    index(req, res, next) {
        User.find({})
            .then(users => res.json(users))
            .catch(next)
    }

    // [Get] /user/account
    account(req, res, next) {
        const userDataToken = req.user
        res.json({message: 'truy cập vào account thành công', data: userDataToken})
    }

    // [Get] /user/account
    purchase(req, res, next) {
        const userDataToken = req.user
        res.json({message: 'truy cập vào purchase thành công', data: userDataToken})
    }

    // [Get] /user/account
    mybooking(req, res, next) {
        const userDataToken = req.user
        res.json({message: 'truy cập vào mybooking thành công', data: userDataToken})
    }
    paycard(req, res, next) {
        const userDataToken = req.user
        res.json({message: 'truy cập vào mybooking thành công', data: userDataToken})
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