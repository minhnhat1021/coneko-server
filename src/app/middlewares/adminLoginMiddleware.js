const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

module.exports = function loginMiddleware (req, res, next) {

    if(!req.body.adminToken) {
        return 
    }
    try {
        const decoded = jwt.verify(req.body.adminToken, process.env.JWT_SECRET)
        
        Admin.findOne({_id: decoded.adminId}) 
            .then((admin) => {
                if(admin) {
                    req.admin = { data: admin }
                }else {
                    res.json({data: {msg: 'Không tìm thấy tài khoản admin này'} })
                }
                next()
            }) 
    }
    catch {
        console.log("Lỗi xác minh admin auth")
        return res.json(undefined)
    }
    
}

