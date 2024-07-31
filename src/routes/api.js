const express = require('express');
const router = express.Router();

const loginRouter = require('./login');
const registerRouter = require('./register');

const userRouter = require('./user');
const usersRouter = require('./users');

const roomsRouter = require('./rooms');

const aboutRouter = require('./about');
const adminRouter = require('./admin')



// api Router

    router.use('/login', loginRouter)
    router.use('/register', registerRouter)

    router.use('/user', userRouter)
    router.use('/users', usersRouter)


    router.use('/rooms', roomsRouter)

    router.use('/about', aboutRouter)
    router.use('/admin', adminRouter)

    





module.exports = router 