const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = function loginMiddleware (req, res, next) {

    if(!req.body.token) {
        return 
    }
    try {
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
        console.log('giải  mã:', decoded)
        User.findOne({_id: decoded.userId}) 
            .then((user) => {
                if(user) {
                    req.user = {data : user}
                }else {
                    res.json({ data: {msg: 'Không tìm thấy tài khoản này'} })
                }
                next()
            }) 
    }
    catch {
        console.log("Lỗi xác minh auth")
        return res.json(undefined)
    }
    
}

