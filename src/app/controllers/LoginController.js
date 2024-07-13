const User = require('../models/User')

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
                    User.updateOne({_id: user._id}, {isActive: true})
                        .then(() => userActive.push(user))
                        .then(() => res.redirect('back')) 
                        // .then(() => userActive.pop())
                        .catch(next)
                }else if(!user) {
                    res.json('thông tin đăng nhập không chính xác')
                }
            })      
    }
}

module.exports = new LoginController