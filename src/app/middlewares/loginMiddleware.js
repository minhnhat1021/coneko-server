const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User')

module.exports = function loginMiddleware (req, res, next) {

    // Nếu không có token
    if(!req.body.token) {
        return 
    }

    // Nếu có token
    try {
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
        User.findOne({_id: decoded.userId}) 
            .then((user) => {
                if(user) {
                    req.user = {data : user}
                }else {
                    res.json({msg: 'Không tìm thấy tài khoản này'})
                }
                next();
            }) 
    }
    catch {
        console.log("loi about")
    }
    
}