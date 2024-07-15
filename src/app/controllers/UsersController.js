const User = require('../models/User')


class UsersController {

    // [Get] / users
    index(req, res, next) {
        User.find({})
            .then(users => res.json(users))
            .catch(next)
    }
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

module.exports = new UsersController