const usersRouter = require('./user')
const siteRouter = require('./site')

function route(app){

    app.use('/users', usersRouter);
    
    app.use('/', siteRouter)
}
module.exports = route