const User = require('../models/User')
var session = require('express-session')
let userActive = [
    
]

class LoginController {
    
    // [GET] 
    getLoginActive(req, res, next) {
        res.json(userActive)
    }
    // [POST]
    login(req, res, next) {
        User.findOne({userName: req.body.userName, password : req.body.password}) 
            .then((user) => {
                if(user) {
                    //1 tao json webtoken
                    //2 su dung session
                    req.session.isAuthenticated = true
                    // User.updateOne({_id: user._id}, {isActive: true})
                    //     .then(() => userActive.push(user))
                    //     .then(() => res.redirect('back')) 
                    //     // .then(() => userActive.pop())
                    //     .catch(next)
                }else if(!user) {
                    res.json('thông tin đăng nhập không chính xác')
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