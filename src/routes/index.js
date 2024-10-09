const siteRouter = require('./site')
const apiRouter = require('./api')

function route(app){

    app.use('/api', apiRouter)
    
    app.use('/', siteRouter)
}
module.exports = route