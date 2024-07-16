const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = function loginMiddleware (req, res, next) {

    // Nếu không có token
    if(!req.body.token) {
        return res.status(401).json({ message: 'Đăng nhập để trải nhiệm không gian của chúng tôi nào'});
    }

    // Nếu có token
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
}