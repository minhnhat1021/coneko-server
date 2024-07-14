const User = require('../models/User')

let infoLogin = {
    data: [
        
    ]
}

class LoginController {
    
    // [GET] 
    getLoginActive(req, res, next) {
        res.json(infoLogin)
    }
    // [POST]
    login(req, res, next) {
        User.findOne({userName: req.body.userName, password : req.body.password}) 
            .then((user) => {
                if(user) {
                    //1 tao json webtoken
                    //2 su dung session 
                    req.session.isAuthenticated = true
                    infoLogin.data.push(user)
                    res.status(200).json({ message: 'Đăng nhập thành công', user, hasSession: req.session })
                }else {
                    res.json({msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác'})
                }
            })      
    }
    logout(req, res, next) {
        req.session.destroy((err) => {
            if(err) {
                return next(err)
            }
            res.redirect('/')
        })
    }
}

module.exports = new LoginController