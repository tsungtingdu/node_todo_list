// include modules and setup server variables 
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const port = 3000
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')

// setup the app
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash())

// Use express session 
app.use(session({
  secret: 'your secret key',
  resave: 'false',
  saveUninitialized: 'false'
}))

// Use Passport 
app.use(passport.initialize())
app.use(passport.session())

// include passport config
require('./config/passport.js')(passport)

app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.isAuthenticated = req.isAuthenticated
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  // res.locals.errors = [{ message: req.flash('error') }]
  next()
})

// connect to db
mongoose.connect('mongodb://localhost/todo', { useNewUrlParser: true, useCreateIndex: true })
const db = mongoose.connection

// Error when connecting to db
db.on('error', () => {
  console.log('MongoDB error!')
})

// Connect to db successfully
db.once('open', () => {
  console.log('MongoDB connected!')
})

// Load models
const Todo = require('./models/todo.js')
const User = require('./models/user.js')

// routes 
app.use('/', require('./routes/home.js'))
app.use('/auth', require('./routes/auths.js'))
app.use('/todos', require('./routes/todo.js'))
app.use('/users', require('./routes/user.js'))

// listening on localhost
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})