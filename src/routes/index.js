const usersRouter = require('./user')
const siteRouter = require('./site')
const registerRouter = require('./register')
const loginRouter = require('./login')

function route(app){

    app.use('/users', usersRouter);
    app.use('/register', registerRouter);
    app.use('/login', loginRouter);
    
    app.use('/', siteRouter)
}
module.exports = route