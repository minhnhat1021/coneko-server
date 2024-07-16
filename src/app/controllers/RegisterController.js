const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User')

let infoRegiter = {
    data: [

    ]
}
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
                    let jwtSecret = crypto.randomBytes(20).toString('hex')
                    const {fullName, email, password} = req.body
                    const displayName = fullName
                    const userName = email
                    const isActive = true;
                    const verifyToken = jwtSecret
                    // Tạo token mã hóa JWT

                    // Mã hóa password theo bảng mật khẩu bcrypt trước khi đưa vào db
                    bcrypt.hash(password, 10, (err, hashedPassword) => {
                        if (err) {
                            throw new Error('lỗi mã hóa mật khẩu');
                        }
                         
                        const userRegister = new User({password: hashedPassword, email, fullName, displayName, userName, isActive, verifyToken});

                        const token = jwt.sign({ userId: userRegister._id }, jwtSecret, { expiresIn: '1h' });

                        userRegister
                            .save()
                            .then(() => {infoRegiter.data.push(userRegister)})
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