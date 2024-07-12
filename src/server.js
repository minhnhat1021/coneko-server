const express = require('express')
const morgan = require('morgan')
const app = express()
const port = 3000   

const route = require('./routes')
const db = require('./config/db')


// connect to db
db.connect()

app.use(express.urlencoded({
    extended: true,
}))
app.use(express.json())
app.use(morgan('combined'))

route(app)




app.listen(port, () => 
  console.log(`Example app listening at http://localhost:${port}`)
)