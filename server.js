const express = require('express')
const morgan = require('morgan')
const app = express()
const port = 5000   
const path = require('path')


//muter

var session = require('express-session')
const cors = require('cors');

const dotenv = require('dotenv')
dotenv.config()

const route = require('./routes')
const db = require('./config/db')

// cho phép gọi lên backend
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')))
console.log('duongdan:',__dirname)

// connect to db
db.connect()

app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use(express.json({ limit: '10mb' }))

app.use(morgan('combined'))

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))

route(app)




app.listen(port, () => 
  console.log(`Example app listening at http://localhost:${port}`)
)