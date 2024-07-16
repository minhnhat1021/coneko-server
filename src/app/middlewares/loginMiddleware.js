const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User')

module.exports = function loginMiddleware (req, res, next) {

    // Nếu không có token
    if(!req.body.token) {
        return res.status(401).json({ message: 'Đăng nhập để trải nhiệm không gian của chúng tôi nào'});
    }

    // Nếu có token
    User.findOne({_id: req.body.id})
        .then((user) => {
            if(!user) {
                return res.json({message: 'Không tìm thấy user này trên hệ thống'})
            }
            const decoded = jwt.verify(req.body.token, user.verifyToken);
            req.user = decoded;
            next();
        })
    
}