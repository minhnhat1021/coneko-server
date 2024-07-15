const User = require('../models/User')
const crypto = require('crypto');

let infoRegiter = {
    data: [

    ]
}
class RegisterController {

    getInfoRegister(req, res, next) {
        res.json(infoRegiter)
    }

    // [POST]
    register(req, res, next) {
        
        User.findOne({email: req.body.email}) 
            .then((user) => {
                if(user) {
                    res.json({ msg: 'Email đã tồn tại '})
                }else {
                    const displayName = req.body.fullName
                    const userName = req.body.email
                    const verifyToken = crypto.randomBytes(20).toString('hex'); 
                    const isActive = true;
                    
                    const userRegister = new User({...req.body, displayName, userName, verifyToken, isActive});

                    req.session.isAuthenticated = true

                    userRegister
                        .save()
                        .then(() => {infoRegiter.data.push(userRegister)})
                        .then(() => 
                            res.status(200).json({ message: 'Đăng ký thành công', user: userRegister, hasSession: req.session })
                        )
                        .catch(next)
                }
            })      
    }
}

module.exports = new RegisterController