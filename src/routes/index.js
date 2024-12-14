const apiRouter = require('./api')



//http://localhost:5000/
function route(app){

    app.use('/api', apiRouter)
    
}
module.exports = route