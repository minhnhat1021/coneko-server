const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
        console.log(req.headers['authorization'])
        const {userName, password} = req.body
        User.findOne({userName: userName}) 
            .then((user) => {
                if(user) {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            throw new Error('lỗi giải mã mật khẩu');
                        }if (isMatch) {
                            //1 tao json webtoken              
                            // crypto.randomBytes(20).toString('hex')  để tạo JWT_secret    
                            
                            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET , { expiresIn: '1h' });
                            infoLogin.data.push({user, token})
                            res.status(200).json({ message: 'Đăng nhập thành công', token})
                        } 
                    })   
                }else {
                    res.json({msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác'})
                }
            })      
    }
    //[GET]
    logout(req, res, next) {
        infoLogin.data.pop()
        res.json({message: 'Đã hết phiên đăng nhập'})
    }
}

module.exports = new LoginController