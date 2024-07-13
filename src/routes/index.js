const usersRouter = require('./user')
const siteRouter = require('./site')
const registerRouter = require('./register')

function route(app){

    app.use('/users', usersRouter);
    app.use('/register', registerRouter);
    
    app.use('/', siteRouter)
}
module.exports = route