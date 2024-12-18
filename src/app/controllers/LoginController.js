const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const axios = require('axios')

const { OAuth2Client } = require('google-auth-library')
const clientGoogle = new OAuth2Client(process.env.GG_CLIENT_ID)
class LoginController {
    
    //[GET] /login/infoLogin
    getLoginActive(req, res, next) {
        res.json(infoLogin)
    }

    // [POST] /login
    login(req, res, next) {
        const {userName, password} = req.body
        User.findOne({ $or: [{ userName: userName }, { email: userName }] }) 
            .then((user) => {
                if(user) {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (isMatch) {
                            //1 tao json webtoken        
                            
                            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,  { expiresIn: '1h' })
                
                            User.updateOne({ _id: user._id }, {
                                verifyToken: token
                            })
                                .then(() => {
                                    return res.status(200).json({ data: { msg: 'Đăng nhập thành công', token} })
                                })
                        } else {
                            return res.json({ data: {msg: 'Thông tin tài khoản hoặc mật khẩu không chính xác'} })
                        }
                        
                    })   
                }else {
                    res.json({ data: {msg: 'Tài khoản này chưa được đăng ký'} })
                }
            })      
    }
    //[POST] /login/out
    logout(req, res, next) {
        User.updateOne({_id: req.user.data._id}, {
            verifyToken: ''
        })
            .then(() => res.json({data: {msg: 'Đã hết phiên đăng nhập'} }))
    }
    async resetPassword(req, res, next) {
        const {userName, identifier} = req.body.payload
        const user = await User.findOne({userName: userName})
        if(!user){
            return res.json({ data: {status: 400, msg: 'Tài khoản này chưa được đăng ký'} })
        } else{
            if(user?.phone === identifier || user?.email === identifier) {
                function generateRandomPassword(length = 8) {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                    let password = ''
                    for (let i = 0; i < length; i++) {
                        const randomIndex = Math.floor(Math.random() * chars.length)
                        password += chars[randomIndex]
                    }
                    return password
                }
                const newPassword = await generateRandomPassword()
                
                try {
                    const hashedPassword = await bcrypt.hash(newPassword, 10)
                    user.password = hashedPassword
                    await user.save()
            
                    return res.json({ data: { status: 200, msg: 'Cấp mật khẩu thành công', newPassword} })
                } catch (err) {
                    console.error('Lỗi mã hóa mật khẩu', err);
                    return res.status(400).json({
                        data: { status: 400, msg: 'Có lỗi xảy ra, vui lòng thử lại' },
                    });
                }
               
            } else {
                return res.json({ data: {status: 400, msg: 'Số điện thoại hoặc email không chính xác'} })
            }
        }
    }
    async googleLogin(req, res, next) {
        const { credential } = req.body

        try {
            const ticket = await clientGoogle.verifyIdToken({
                idToken: credential,
                audience: process.env.GG_CLIENT_ID, 
            })
            
            const payload = ticket.getPayload()
            const { sub, email, name, picture } = payload

            let user = await User.findOne({email: email}) 

            if(!user) {
                const fullName = name
                const displayName = fullName
                const userName = email
                const isActive = true
                const googleId = sub
                const avatarGoogleUrl = picture
                const userGoogle = new User({ email, fullName, displayName, userName, isActive, googleId, avatarGoogleUrl})

                await userGoogle.save()

                const token = jwt.sign({ userId: userGoogle._id }, process.env.JWT_SECRET,  { expiresIn: '1h' })
                await User.updateOne({ _id: userGoogle._id }, {
                    verifyToken: token
                })

                res.status(200).json({ data: { msg: 'Đăng ký bằng google thành công', token } })
                    
                    
            } else if(user){
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,  { expiresIn: '1h' })
                await User.updateOne({ _id: user._id }, {verifyToken: token})

                return res.status(200).json({ data: { msg: 'Đăng nhập bằng google thành công', token} })
            }

        } catch (error) {
            console.error('Error verifying token:', error)
            res.status(401).json({ msg: 'Xác thực không thành công!' })
        }
    }
    async facebookLogin(req, res, next) {
        const { accessToken } = req.body

        if(!accessToken) {
            return res.json({data: {msg: 'Token facebook không hợp lệ hoặc không có'}})
        }
        let response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`)

        const { id, name, email, picture } = response.data
        if(!id) {
            return res.json({data: {msg: 'Đăng nhập bằng facebook thất bại'}})
        }

        const user = await User.findOne({ facebookId: id })

        if(!user) {
            const fullName = name
            const displayName = fullName
            const userName = email
            const isActive = true
            const facebookId = id   
            const avatarFacebookUrl = picture.data.url
            const userFacebook = new User({ email, fullName, displayName, userName, isActive, facebookId, avatarFacebookUrl})

            await userFacebook.save()

            const token = jwt.sign({ userId: userFacebook._id }, process.env.JWT_SECRET,  { expiresIn: '1h' })
            await User.updateOne({ _id: userFacebook._id }, {
                verifyToken: token
            })

            res.status(200).json({ data: { msg: 'Đăng ký bằng facebook thành công', token } })
        } else if(user){
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,  { expiresIn: '1h' })
            await User.updateOne({ _id: user._id }, {verifyToken: token})

            return res.status(200).json({ data: { msg: 'Đăng nhập bằng facebook thành công', token} })
        }
    }
}

module.exports = new LoginController