const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const AppError = require('./util/apperrorclass')
const Globalerrormiddleware = require('./controller/Errorcontroller')
const gamesrouter = require('./routes/gameroutes')
const userrouter = require('./routes/userroutes')

const app = express()
app.use(express.json())
////////////////
//middlewares
////////////////////////
//third party middlewares
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    max:100,
    windowMs:60 * 60 * 1000,
    message:'Too many request from this IP, please try again in an hour'
})

// app.use('/api',limiter)

////////////////////////
// app.use((req,res,next) => {
//     console.log('hello middleware')
//     next()
// })
// app.use((req,res,next) => {
//     req.requestTime = new Date().toISOString()
//     next()
// })
//////////////////

app.use('/api/v1/games-competetions',gamesrouter)
app.use('/api/v1/users',userrouter)

//unhandled route handler
app.all('*',(req,res,next) => {

    next(new AppError(`Cant find the ${req.originalUrl} on the server`,404))

})

//error handling with express //error handling middleware

app.use(Globalerrormiddleware)

module.exports = app