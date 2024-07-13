const User = require('../models/User')

class LoginController {

    // [POST]
    login(req, res) {
        User.findOne({userName: req.body.userName, password : req.body.password}) 
            .then((user) => {
                if(user) {
                    res.json(`đăng nhập thành công vào tài khoản : ${user}`)
                }else if(!user) {
                    res.json('thông tin đăng nhập không chính xác')
                }
            })      
    }
}

module.exports = new LoginController