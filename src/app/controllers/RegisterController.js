const User = require('../models/User')
const crypto = require('crypto');
class RegisterController {

    // [POST]
    register(req, res) {
        User.findOne({email: req.body.email}) 
            .then((user) => {
                if(user) {
                    res.json(user)
                }else if(!user) {
                    const displayName = req.body.fullName
                    const userName = req.body.email
                    const verifyToken = crypto.randomBytes(20).toString('hex'); 
                    const isActive = false;
                    
                    const userRegister = new User({...req.body, displayName, userName, verifyToken, isActive});
                    userRegister.save()

                    res.json({
                        message: 'Đăng ký thành công',
                        user: userRegister
                    })
                }
            })      
    }
}

module.exports = new RegisterController