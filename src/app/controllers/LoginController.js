const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User')


class LoginController {
    
    //[GET] /login/infoLogin
    getLoginActive(req, res, next) {
        res.json(infoLogin)
    }

    // [POST] /login
    login(req, res, next) {
        const {userName, password} = req.body
        User.findOne({userName: userName}) 
            .then((user) => {
                if(user) {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (isMatch) {
                            //1 tao json webtoken        
                            
                            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,  { expiresIn: '1h' });
                
                            User.updateOne({ _id: user._id }, {
                                verifyToken: token
                            })
                                .then(() => {
                                    return res.status(200).json({ message: 'Đăng nhập thành công', token, userId: user._id})
                                })
                        } else {
                            return res.json({ msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác' });
                        }
                        
                    })   
                }else {
                    res.json({msg: 'Tài khoản này chưa được đăng ký'})
                }
            })      
    }
    //[POST] /login/out
    logout(req, res, next) {
        User.updateOne({_id: req.body.id}, {
            verifyToken: ''
        })
            
            .then(() => res.json({message: 'Đã hết phiên đăng nhập'}))
    }
}

module.exports = new LoginController