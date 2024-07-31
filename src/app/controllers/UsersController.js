const User = require('../models/User')


class UsersController {

    // [Get] /users/search?q=
    findUser(req, res) {
        
        const {q} = req.query

        User.find({ fullName: { $regex: q, $options: 'i' } }) 
        .then((data) => {

            if(data.length === 0) {
                res.json({msg: 'Không tìm thấy tài khoản này', data : []})
            }else {
                res.status(200).json({ message: 'Đã tìm thấy tài khoản', data })
            }
        })    

    }
}

module.exports = new UsersController