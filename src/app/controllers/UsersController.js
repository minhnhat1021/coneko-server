const User = require('../models/User')


class UsersController {
    
    // [Get] /users
    userList(req, res, next) {
        
        User.find({}) 
            .then(users => 
                res.json({ data: { users } })
            )    
            .catch(err => next(err))      
    }

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
    // [Post] /users/filter-options
    
    async filterUsersByOptions(req, res, next) {
        try {
            const { options } = req.body
            console.log(options)
            let filterCriteria = {}
    
            // Loại giường
            const bedTypes = []
            if (options.includes('silver')) {
                bedTypes.push('silver')
            }
            if (options.includes('gold')) {
                bedTypes.push('gold')
            }
            if (options.includes('platinum')) {
                bedTypes.push('platinum')
            }
            if (options.includes('diamond')) {
                bedTypes.push('diamond')
            }
            if (options.includes('vip')) {
                bedTypes.push('vip')
            }
            if (bedTypes.length > 0) {
                filterCriteria.level = { $in: bedTypes }
            }
            console.log(filterCriteria)
            const users = await User.find(filterCriteria)
            res.status(200).json({ data: {msg: 'Danh sách phòng sau khi lọc', users} })

        } catch (error) {
            res.status(500).json({ data: {msg: 'Lỗi lọc phòng bằng options'} })
        }
        
    }
}

module.exports = new UsersController