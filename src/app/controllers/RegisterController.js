const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User')


class RegisterController {

    //[GET] /register/infoRegister
    getInfoRegister(req, res, next) {
        res.json(infoRegiter)
    }

    // [POST] /register
    register(req, res, next) {
        
        User.findOne({email: req.body.email}) 
            .then((user) => {
                if(user) {
                    res.json({ msg: 'Email đã tồn tại '})
                }else {
                    const {fullName, email, password} = req.body
                    const displayName = fullName
                    const userName = email
                    const isActive = true;
                    
                    // Tạo token mã hóa JWT

                    // Mã hóa password theo bảng mật khẩu bcrypt trước khi đưa vào db
                    bcrypt.hash(password, 10, (err, hashedPassword) => {
                        if (err) {
                            throw new Error('lỗi mã hóa mật khẩu');
                        }
                        
                        const token = jwt.sign({ }, process.env.JWT_SECRET, { expiresIn: '1h' });
                        const verifyToken = token
                        
                        const userRegister = new User({password: hashedPassword, email, fullName, verifyToken, displayName, userName, isActive, verifyToken});


                        userRegister
                            .save()
                            .then(() => 
                                res.status(200).json({ message: 'Đăng ký thành công', token, userId: userRegister._id })
                            )
                            .catch(next)
                    })
                    
                }
            })      
    }
}

module.exports = new RegisterController