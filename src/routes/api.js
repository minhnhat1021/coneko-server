const express = require('express');
const router = express.Router();

const loginRouter = require('./login');
const registerRouter = require('./register');
const usersRouter = require('./users');

// api Router

    router.use('/login', loginRouter)
    router.use('/register', registerRouter)
    router.use('/users', usersRouter)



module.exports = router 